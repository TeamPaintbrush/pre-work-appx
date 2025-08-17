"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAriaLiveRegion, useAccessibilityPreferences } from '../../hooks/useAccessibility';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  checklistId?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notificationMethods: ('browser' | 'email' | 'sound')[];
  createdAt: Date;
  lastNotified?: Date;
}

interface ReminderManagerProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => void;
  onDeleteReminder: (id: string) => void;
  checklistTitle?: string;
  checklistId?: string;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  checklistTitle,
  checklistId
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [notifications, setNotifications] = useState<Reminder[]>([]);
  const { announce } = useAriaLiveRegion();
  const { prefersReducedMotion } = useAccessibilityPreferences();

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const dueReminders = reminders.filter(reminder => {
        if (reminder.isCompleted) return false;
        
        const timeDiff = reminder.dueDate.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        // Check if reminder is due within 15 minutes
        return minutesDiff <= 15 && minutesDiff > 0;
      });

      if (dueReminders.length > 0) {
        setNotifications(dueReminders);
        dueReminders.forEach(reminder => {
          if (reminder.notificationMethods.includes('browser')) {
            showBrowserNotification(reminder);
          }
          if (reminder.notificationMethods.includes('sound')) {
            playNotificationSound();
          }
        });
      }
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminders]);

  const showBrowserNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Reminder: ${reminder.title}`, {
        body: reminder.description || `Due at ${reminder.dueDate.toLocaleTimeString()}`,
        icon: '/favicon.ico',
        tag: reminder.id
      });
    }
  };

  const playNotificationSound = () => {
    // Create a simple notification sound using Web Audio API
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        announce('Browser notifications enabled for reminders', 'polite');
      }
    }
  };

  const handleCompleteReminder = (reminder: Reminder) => {
    onUpdateReminder(reminder.id, { isCompleted: true });
    announce(`Reminder "${reminder.title}" marked as completed`, 'polite');
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'Overdue';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getPriorityColor = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const upcomingReminders = reminders
    .filter(r => !r.isCompleted && r.dueDate > new Date())
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reminders {checklistTitle && `for ${checklistTitle}`}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your checklist reminders and notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={requestNotificationPermission}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a3 3 0 116 0v12z" />
              </svg>
            }
          >
            Enable Notifications
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Active Notifications */}
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">
                  Reminder Due: {notification.title}
                </h3>
                {notification.description && (
                  <p className="text-sm text-yellow-700 mt-1">
                    {notification.description}
                  </p>
                )}
                <p className="text-xs text-yellow-600 mt-2">
                  Due: {notification.dueDate.toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  size="xs"
                  variant="success"
                  onClick={() => handleCompleteReminder(notification)}
                >
                  Complete
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Reminders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingReminders.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No upcoming reminders</p>
              <p className="text-sm">Add a reminder to stay on track with your checklists</p>
            </div>
          ) : (
            upcomingReminders.map(reminder => (
              <div key={reminder.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {reminder.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority}
                      </span>
                      {reminder.isRecurring && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {reminder.recurrencePattern}
                        </span>
                      )}
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Due: {reminder.dueDate.toLocaleString()}</span>
                      <span>In: {formatRelativeTime(reminder.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setEditingReminder(reminder)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="success"
                      onClick={() => handleCompleteReminder(reminder)}
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Reminder Modal */}
      <ReminderForm
        isOpen={isCreateModalOpen || !!editingReminder}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingReminder(null);
        }}
        onSubmit={(reminderData) => {
          if (editingReminder) {
            onUpdateReminder(editingReminder.id, reminderData);
            announce('Reminder updated successfully', 'polite');
          } else {
            onAddReminder(reminderData);
            announce('Reminder created successfully', 'polite');
          }
          setIsCreateModalOpen(false);
          setEditingReminder(null);
        }}
        editingReminder={editingReminder}
        checklistId={checklistId}
      />
    </div>
  );
};

// Reminder Form Component
interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Reminder, 'id' | 'createdAt'>) => void;
  editingReminder?: Reminder | null;
  checklistId?: string;
}

const ReminderForm: React.FC<ReminderFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingReminder,
  checklistId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium' as Reminder['priority'],
    isRecurring: false,
    recurrencePattern: 'weekly' as Reminder['recurrencePattern'],
    notificationMethods: ['browser'] as Reminder['notificationMethods']
  });

  useEffect(() => {
    if (editingReminder) {
      const dueDate = new Date(editingReminder.dueDate);
      setFormData({
        title: editingReminder.title,
        description: editingReminder.description || '',
        dueDate: dueDate.toISOString().split('T')[0],
        dueTime: dueDate.toTimeString().slice(0, 5),
        priority: editingReminder.priority,
        isRecurring: editingReminder.isRecurring,
        recurrencePattern: editingReminder.recurrencePattern || 'weekly',
        notificationMethods: editingReminder.notificationMethods
      });
    } else {
      // Reset form for new reminder
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: '',
        description: '',
        dueDate: tomorrow.toISOString().split('T')[0],
        dueTime: '09:00',
        priority: 'medium',
        isRecurring: false,
        recurrencePattern: 'weekly',
        notificationMethods: ['browser']
      });
    }
  }, [editingReminder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
    
    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      dueDate: dueDateTime,
      priority: formData.priority,
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
      notificationMethods: formData.notificationMethods,
      checklistId: checklistId,
      isCompleted: false,
      lastNotified: undefined
    });
  };

  const toggleNotificationMethod = (method: 'browser' | 'email' | 'sound') => {
    setFormData(prev => ({
      ...prev,
      notificationMethods: prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="reminder-title" className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Title *
          </label>
          <input
            type="text"
            id="reminder-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter reminder title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="reminder-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="reminder-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reminder-date" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              id="reminder-date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 mb-2">
              Due Time *
            </label>
            <input
              type="time"
              id="reminder-time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="reminder-priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            id="reminder-priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Reminder['priority'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Recurring */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is-recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is-recurring" className="ml-2 block text-sm text-gray-700">
              Recurring reminder
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label htmlFor="recurrence-pattern" className="block text-sm font-medium text-gray-700 mb-2">
                Repeat Every
              </label>
              <select
                id="recurrence-pattern"
                value={formData.recurrencePattern}
                onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value as Reminder['recurrencePattern'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </div>

        {/* Notification Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Notification Methods
          </label>
          <div className="space-y-2">
            {[
              { key: 'browser', label: 'Browser Notifications', icon: '🔔' },
              { key: 'email', label: 'Email Notifications', icon: '📧' },
              { key: 'sound', label: 'Sound Alert', icon: '🔊' }
            ].map(({ key, label, icon }) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`notification-${key}`}
                  checked={formData.notificationMethods.includes(key as any)}
                  onChange={() => toggleNotificationMethod(key as any)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`notification-${key}`} className="ml-2 block text-sm text-gray-700">
                  {icon} {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {editingReminder ? 'Update Reminder' : 'Create Reminder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReminderManager;
