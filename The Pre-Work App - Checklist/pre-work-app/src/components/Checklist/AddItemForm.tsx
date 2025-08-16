"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChecklistItem, Priority } from '../../types';
import { useAriaLiveRegion, useAccessibilityPreferences } from '../../hooks/useAccessibility';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<ChecklistItem, 'id'>) => void;
  sectionId: string;
}

const AddItemForm: React.FC<AddItemFormProps> = ({
  isOpen,
  onClose,
  onAddItem,
  sectionId
}) => {
  const { announce } = useAriaLiveRegion();
  const { prefersHighContrast } = useAccessibilityPreferences();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    text: '',
    description: '',
    priority: 'medium' as Priority,
    isRequired: false,
    estimatedTime: '',
    tags: '',
    customFields: {}
  });

  // Focus management
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.text.trim()) {
      newErrors.text = 'Task description is required';
    }
    
    if (formData.estimatedTime && !/^\d+\s*(min|minute|minutes|hour|hours|h|m)?s?$/i.test(formData.estimatedTime)) {
      newErrors.estimatedTime = 'Please enter a valid time format (e.g., "30 minutes", "1 hour")';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announce('Please correct the form errors before submitting', 'assertive');
      return;
    }

    const newItem: Omit<ChecklistItem, 'id'> = {
      text: formData.text.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      isCompleted: false,
      isRequired: formData.isRequired,
      notes: '',
      attachments: [],
      timestamp: new Date(),
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) || undefined : undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      customFields: formData.customFields,
      isCustom: true
    };

    onAddItem(newItem);
    announce('New task added successfully', 'polite');
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      text: '',
      description: '',
      priority: 'medium',
      isRequired: false,
      estimatedTime: '',
      tags: '',
      customFields: {}
    });
    setErrors({});
    onClose();
  };

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    prefersHighContrast 
      ? 'border-gray-800 bg-white text-gray-900 focus:ring-blue-300' 
      : 'border-gray-300 focus:ring-blue-500'
  }`;

  const errorInputClasses = `w-full px-3 py-2 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
    prefersHighContrast ? 'bg-red-50' : ''
  }`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Custom Checklist Item" size="lg">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Item Text */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Task Description *
            </label>
            <input
              ref={firstInputRef}
              type="text"
              id="text"
              value={formData.text}
              onChange={(e) => {
                setFormData({ ...formData, text: e.target.value });
                if (errors.text) {
                  setErrors({ ...errors, text: '' });
                }
              }}
              placeholder="Enter the task description..."
              className={errors.text ? errorInputClasses : inputClasses}
              required
              aria-required="true"
              aria-invalid={!!errors.text}
              aria-describedby={errors.text ? "text-error" : undefined}
            />
            {errors.text && (
              <p id="text-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.text}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional details or instructions..."
              rows={3}
              className={inputClasses}
              aria-describedby="description-hint"
            />
            <p id="description-hint" className="mt-1 text-sm text-gray-500">
              Optional: Provide more context for this task
            </p>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              className={inputClasses}
              aria-describedby="priority-hint"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <p id="priority-hint" className="mt-1 text-sm text-gray-500">
              Higher priority tasks appear at the top of the list
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estimated Time */}
            <div>
              <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time
              </label>
              <input
                type="text"
                id="estimatedTime"
                value={formData.estimatedTime}
                onChange={(e) => {
                  setFormData({ ...formData, estimatedTime: e.target.value });
                  if (errors.estimatedTime) {
                    setErrors({ ...errors, estimatedTime: '' });
                  }
                }}
                placeholder="e.g., 15 minutes, 1 hour"
                className={errors.estimatedTime ? errorInputClasses : inputClasses}
                aria-invalid={!!errors.estimatedTime}
                aria-describedby={errors.estimatedTime ? "time-error" : "time-hint"}
              />
              {errors.estimatedTime ? (
                <p id="time-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.estimatedTime}
                </p>
              ) : (
                <p id="time-hint" className="mt-1 text-sm text-gray-500">
                  Optional: How long this task typically takes
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="safety, cleaning, inspection"
                className={inputClasses}
                aria-describedby="tags-hint"
              />
              <p id="tags-hint" className="mt-1 text-sm text-gray-500">
                Optional: Comma-separated tags for organization
              </p>
            </div>
          </div>

          {/* Required Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="isRequired"
              checked={formData.isRequired}
              onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${
                prefersHighContrast ? 'border-gray-800' : ''
              }`}
              aria-describedby="required-hint"
            />
            <div className="ml-3">
              <label htmlFor="isRequired" className="block text-sm text-gray-700 font-medium">
                Required Task
              </label>
              <p id="required-hint" className="text-sm text-gray-500">
                This task must be completed before the checklist can be marked as finished
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddItemForm;
