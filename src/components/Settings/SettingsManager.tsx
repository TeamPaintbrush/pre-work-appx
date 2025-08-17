"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAriaLiveRegion, useAccessibilityPreferences } from '../../hooks/useAccessibility';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

export interface AppSettings {
  // General Settings
  general: {
    defaultView: 'list' | 'grid' | 'kanban';
    autoSave: boolean;
    autoSaveInterval: number; // in minutes
    confirmBeforeDelete: boolean;
    showProgressInTitle: boolean;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    language: string;
    timezone: string;
  };
  
  // Accessibility Settings
  accessibility: {
    enableScreenReader: boolean;
    enableKeyboardNavigation: boolean;
    highContrastMode: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    focusIndicatorSize: 'thin' | 'medium' | 'thick';
    announceProgressUpdates: boolean;
    enableSoundNotifications: boolean;
  };
  
  // Notification Settings
  notifications: {
    enableBrowserNotifications: boolean;
    enableEmailNotifications: boolean;
    reminderFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
    deadlineAlerts: boolean;
    teamUpdates: boolean;
    templateSharing: boolean;
    auditLogChanges: boolean;
  };
  
  // Export Settings
  export: {
    defaultFormat: 'PDF' | 'Excel' | 'CSV' | 'JSON';
    includeMedia: boolean;
    includeTimestamps: boolean;
    includeComments: boolean;
    includeAuditLog: boolean;
    compressionLevel: 'none' | 'low' | 'medium' | 'high';
  };
  
  // Privacy Settings
  privacy: {
    shareUsageData: boolean;
    shareErrorReports: boolean;
    enableAnalytics: boolean;
    dataRetentionPeriod: number; // in days
    requireConsentForTemplateSharing: boolean;
  };
  
  // Advanced Settings
  advanced: {
    enableDeveloperMode: boolean;
    enableExperimentalFeatures: boolean;
    maxUndoSteps: number;
    cacheSize: number; // in MB
    enableDebugMode: boolean;
    customCSS: string;
  };
}

const defaultSettings: AppSettings = {
  general: {
    defaultView: 'list',
    autoSave: true,
    autoSaveInterval: 5,
    confirmBeforeDelete: true,
    showProgressInTitle: true,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  accessibility: {
    enableScreenReader: false,
    enableKeyboardNavigation: true,
    highContrastMode: false,
    reducedMotion: false,
    fontSize: 'medium',
    focusIndicatorSize: 'medium',
    announceProgressUpdates: true,
    enableSoundNotifications: false
  },
  notifications: {
    enableBrowserNotifications: false,
    enableEmailNotifications: false,
    reminderFrequency: 'never',
    deadlineAlerts: true,
    teamUpdates: true,
    templateSharing: true,
    auditLogChanges: false
  },
  export: {
    defaultFormat: 'PDF',
    includeMedia: true,
    includeTimestamps: true,
    includeComments: true,
    includeAuditLog: false,
    compressionLevel: 'medium'
  },
  privacy: {
    shareUsageData: false,
    shareErrorReports: true,
    enableAnalytics: false,
    dataRetentionPeriod: 365,
    requireConsentForTemplateSharing: true
  },
  advanced: {
    enableDeveloperMode: false,
    enableExperimentalFeatures: false,
    maxUndoSteps: 50,
    cacheSize: 100,
    enableDebugMode: false,
    customCSS: ''
  }
};

interface SettingsManagerProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetSettings: () => void;
  onExportSettings: () => void;
  onImportSettings: (file: File) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onExportSettings,
  onImportSettings
}) => {
  const [activeTab, setActiveTab] = useState<keyof AppSettings>('general');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { announce } = useAriaLiveRegion();
  const { prefersReducedMotion, prefersHighContrast } = useAccessibilityPreferences();

  useEffect(() => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
  }, [settings]);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + number keys for quick tab switching
      if (event.altKey && event.key >= '1' && event.key <= '6') {
        event.preventDefault();
        const tabIndex = parseInt(event.key) - 1;
        const tabKeys = ['general', 'accessibility', 'notifications', 'export', 'privacy', 'advanced'] as const;
        if (tabKeys[tabIndex]) {
          setActiveTab(tabKeys[tabIndex]);
          announce(`Switched to ${tabKeys[tabIndex]} settings`, 'polite');
        }
      }
      
      // Ctrl + S to save settings
      if (event.ctrlKey && event.key === 's' && hasUnsavedChanges) {
        event.preventDefault();
        saveSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges]);

  const updateSetting = (category: keyof AppSettings, key: string, value: any) => {
    const newSettings = {
      ...localSettings,
      [category]: {
        ...localSettings[category],
        [key]: value
      }
    };
    setLocalSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    onUpdateSettings(localSettings);
    setHasUnsavedChanges(false);
    announce('Settings saved successfully', 'polite');
  };

  const discardChanges = () => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
    announce('Changes discarded', 'polite');
  };

  const resetToDefaults = () => {
    if (resetConfirmation !== 'RESET') {
      announce('Please type RESET to confirm', 'assertive');
      return;
    }
    
    onResetSettings();
    setLocalSettings(defaultSettings);
    setHasUnsavedChanges(false);
    setIsResetModalOpen(false);
    setResetConfirmation('');
    announce('All settings have been reset to their default values', 'polite');
  };

  const tabs = [
    { key: 'general', label: 'General', icon: '⚙️', shortcut: 'Alt+1' },
    { key: 'accessibility', label: 'Accessibility', icon: '♿', shortcut: 'Alt+2' },
    { key: 'notifications', label: 'Notifications', icon: '🔔', shortcut: 'Alt+3' },
    { key: 'export', label: 'Export', icon: '📤', shortcut: 'Alt+4' },
    { key: 'privacy', label: 'Privacy', icon: '🔒', shortcut: 'Alt+5' },
    { key: 'advanced', label: 'Advanced', icon: '🔧', shortcut: 'Alt+6' }
  ] as const;

  const filteredTabs = searchQuery
    ? tabs.filter(tab =>
        tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.keys(localSettings[tab.key]).some(key =>
          key.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : tabs;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your Pre-Work App experience and preferences
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="settings-search" className="sr-only">
          Search settings
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="settings-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              prefersHighContrast ? 'border-gray-800 bg-white' : 'border-gray-300'
            }`}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Enhanced Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1" role="tablist" aria-orientation="vertical" aria-label="Settings categories">
            {filteredTabs.map((tab, index) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  announce(`Switched to ${tab.label} settings`, 'polite');
                }}
                onKeyDown={(e) => {
                  // Arrow key navigation
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % filteredTabs.length;
                    const nextButton = document.querySelector(`[data-tab="${filteredTabs[nextIndex].key}"]`) as HTMLButtonElement;
                    nextButton?.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = index === 0 ? filteredTabs.length - 1 : index - 1;
                    const prevButton = document.querySelector(`[data-tab="${filteredTabs[prevIndex].key}"]`) as HTMLButtonElement;
                    prevButton?.focus();
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                  activeTab === tab.key
                    ? prefersHighContrast
                      ? 'bg-gray-900 text-white border-2 border-gray-700'
                      : 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : prefersHighContrast
                    ? 'text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
                }`}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`${tab.key}-panel`}
                data-tab={tab.key}
                title={`${tab.label} settings (${tab.shortcut})`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg" aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                <span className="text-xs text-gray-400 hidden lg:block" aria-label={`Keyboard shortcut: ${tab.shortcut}`}>
                  {tab.shortcut}
                </span>
              </button>
            ))}
          </nav>

          {/* Keyboard shortcuts help */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
            <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
            <ul className="space-y-1">
              <li>• Alt + 1-6: Switch tabs</li>
              <li>• Ctrl + S: Save changes</li>
              <li>• ↑↓ arrows: Navigate tabs</li>
              <li>• Tab: Navigate controls</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportSettings}
              className="w-full justify-start"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Export Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) onImportSettings(file);
                };
                input.click();
              }}
              className="w-full justify-start"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              }
            >
              Import Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              className="w-full justify-start text-red-600 hover:text-red-700"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Tab Content */}
            <div
              id={`${activeTab}-panel`}
              role="tabpanel"
              aria-labelledby={`${activeTab}-tab`}
              className="p-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'general' && (
                    <GeneralSettings
                      settings={localSettings.general}
                      onUpdate={(key, value) => updateSetting('general', key, value)}
                    />
                  )}
                  {activeTab === 'accessibility' && (
                    <AccessibilitySettings
                      settings={localSettings.accessibility}
                      onUpdate={(key, value) => updateSetting('accessibility', key, value)}
                    />
                  )}
                  {activeTab === 'notifications' && (
                    <NotificationSettings
                      settings={localSettings.notifications}
                      onUpdate={(key, value) => updateSetting('notifications', key, value)}
                    />
                  )}
                  {activeTab === 'export' && (
                    <ExportSettings
                      settings={localSettings.export}
                      onUpdate={(key, value) => updateSetting('export', key, value)}
                    />
                  )}
                  {activeTab === 'privacy' && (
                    <PrivacySettings
                      settings={localSettings.privacy}
                      onUpdate={(key, value) => updateSetting('privacy', key, value)}
                    />
                  )}
                  {activeTab === 'advanced' && (
                    <AdvancedSettings
                      settings={localSettings.advanced}
                      onUpdate={(key, value) => updateSetting('advanced', key, value)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Enhanced Actions Bar for Unsaved Changes */}
            {hasUnsavedChanges && (
              <div 
                className="px-6 py-4 bg-yellow-50 border-t border-yellow-200"
                role="alert"
                aria-live="polite"
                aria-label="Unsaved changes notification"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-yellow-800">
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>
                      You have unsaved changes in your settings
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={discardChanges}
                      className="focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                      aria-label="Discard all unsaved changes"
                    >
                      Discard Changes
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={saveSettings}
                      className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Save all changes (Ctrl+S)"
                      title="Keyboard shortcut: Ctrl+S"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetConfirmation('');
        }}
        title="Reset All Settings to Defaults"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3" id="reset-modal-title">
                Are you sure you want to reset all settings?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  This action will permanently restore all settings to their factory defaults, including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>General preferences and display options</li>
                  <li>Accessibility settings and customizations</li>
                  <li>Notification preferences and channels</li>
                  <li>Export settings and file formats</li>
                  <li>Privacy controls and data sharing options</li>
                  <li>Advanced features and developer settings</li>
                </ul>
                <p className="font-medium text-red-700">
                  ⚠️ This action cannot be undone. Your current settings will be permanently lost.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <label 
              htmlFor="reset-confirmation" 
              className="block text-sm font-medium text-red-800 mb-2"
            >
              To confirm this action, please type <strong>RESET</strong> in the field below:
            </label>
            <input
              type="text"
              id="reset-confirmation"
              value={resetConfirmation}
              onChange={(e) => setResetConfirmation(e.target.value)}
              placeholder="Type RESET to confirm"
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none text-sm"
              aria-describedby="reset-confirmation-help"
              autoComplete="off"
            />
            <p id="reset-confirmation-help" className="mt-1 text-xs text-red-600">
              This confirmation helps prevent accidental resets
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsResetModalOpen(false);
                setResetConfirmation('');
              }}
              className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={resetToDefaults}
              disabled={resetConfirmation !== 'RESET'}
              className={`focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                resetConfirmation !== 'RESET' 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-red-700'
              }`}
              aria-describedby="reset-button-help"
            >
              Reset All Settings
            </Button>
          </div>
          <p id="reset-button-help" className="text-xs text-gray-500 text-center">
            Button will be enabled once you type "RESET" above
          </p>
        </div>
      </Modal>
    </div>
  );
};

// Individual Settings Components
const GeneralSettings: React.FC<{
  settings: AppSettings['general'];
  onUpdate: (key: string, value: any) => void;
}> = ({ settings, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Configure basic app behavior and preferences
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default View
        </label>
        <select
          value={settings.defaultView}
          onChange={(e) => onUpdate('defaultView', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="list">List View</option>
          <option value="grid">Grid View</option>
          <option value="kanban">Kanban Board</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Auto-Save Interval
        </label>
        <select
          value={settings.autoSaveInterval}
          onChange={(e) => onUpdate('autoSaveInterval', parseInt(e.target.value))}
          disabled={!settings.autoSave}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value={1}>1 minute</option>
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={30}>30 minutes</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Format
        </label>
        <select
          value={settings.dateFormat}
          onChange={(e) => onUpdate('dateFormat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Format
        </label>
        <select
          value={settings.timeFormat}
          onChange={(e) => onUpdate('timeFormat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="12h">12-hour (AM/PM)</option>
          <option value="24h">24-hour</option>
        </select>
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="auto-save"
          checked={settings.autoSave}
          onChange={(e) => onUpdate('autoSave', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="auto-save" className="ml-2 block text-sm text-gray-700">
          Enable auto-save
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="confirm-delete"
          checked={settings.confirmBeforeDelete}
          onChange={(e) => onUpdate('confirmBeforeDelete', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="confirm-delete" className="ml-2 block text-sm text-gray-700">
          Confirm before deleting items
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="progress-title"
          checked={settings.showProgressInTitle}
          onChange={(e) => onUpdate('showProgressInTitle', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="progress-title" className="ml-2 block text-sm text-gray-700">
          Show progress in browser title
        </label>
      </div>
    </div>
  </div>
);

const AccessibilitySettings: React.FC<{
  settings: AppSettings['accessibility'];
  onUpdate: (key: string, value: any) => void;
}> = ({ settings, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Accessibility Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Customize accessibility features for better usability
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size
        </label>
        <select
          value={settings.fontSize}
          onChange={(e) => onUpdate('fontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="extra-large">Extra Large</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Focus Indicator Size
        </label>
        <select
          value={settings.focusIndicatorSize}
          onChange={(e) => onUpdate('focusIndicatorSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="thin">Thin</option>
          <option value="medium">Medium</option>
          <option value="thick">Thick</option>
        </select>
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="screen-reader"
          checked={settings.enableScreenReader}
          onChange={(e) => onUpdate('enableScreenReader', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="screen-reader" className="ml-2 block text-sm text-gray-700">
          Enhanced screen reader support
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="keyboard-nav"
          checked={settings.enableKeyboardNavigation}
          onChange={(e) => onUpdate('enableKeyboardNavigation', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="keyboard-nav" className="ml-2 block text-sm text-gray-700">
          Enhanced keyboard navigation
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="high-contrast"
          checked={settings.highContrastMode}
          onChange={(e) => onUpdate('highContrastMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="high-contrast" className="ml-2 block text-sm text-gray-700">
          High contrast mode
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="reduced-motion"
          checked={settings.reducedMotion}
          onChange={(e) => onUpdate('reducedMotion', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="reduced-motion" className="ml-2 block text-sm text-gray-700">
          Reduce motion and animations
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="announce-progress"
          checked={settings.announceProgressUpdates}
          onChange={(e) => onUpdate('announceProgressUpdates', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="announce-progress" className="ml-2 block text-sm text-gray-700">
          Announce progress updates
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="sound-notifications"
          checked={settings.enableSoundNotifications}
          onChange={(e) => onUpdate('enableSoundNotifications', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="sound-notifications" className="ml-2 block text-sm text-gray-700">
          Enable sound notifications
        </label>
      </div>
    </div>
  </div>
);

const NotificationSettings: React.FC<{
  settings: AppSettings['notifications'];
  onUpdate: (key: string, value: any) => void;
}> = ({ settings, onUpdate }) => {
  const [notificationChannels, setNotificationChannels] = useState({
    email: settings.enableEmailNotifications,
    browser: settings.enableBrowserNotifications,
    push: false // New channel
  });

  const handleChannelToggle = (channel: keyof typeof notificationChannels, enabled: boolean) => {
    setNotificationChannels(prev => ({ ...prev, [channel]: enabled }));
    
    // Update the original settings based on channel
    if (channel === 'email') {
      onUpdate('enableEmailNotifications', enabled);
    } else if (channel === 'browser') {
      onUpdate('enableBrowserNotifications', enabled);
    }
  };

  const handleReminderToggle = (type: string, enabled: boolean) => {
    onUpdate(type, enabled);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4" id="notification-settings-heading">
          Notification Settings
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Control when and how you receive notifications and reminders
        </p>
      </div>

      {/* Reminder Frequency */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium text-gray-900">Reminder Frequency</legend>
        <div>
          <label htmlFor="reminder-frequency" className="block text-sm font-medium text-gray-700 mb-2">
            How often would you like to receive reminders?
          </label>
          <select
            id="reminder-frequency"
            value={settings.reminderFrequency}
            onChange={(e) => onUpdate('reminderFrequency', e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
            aria-describedby="reminder-frequency-description"
          >
            <option value="never">Never send reminders</option>
            <option value="daily">Daily reminders</option>
            <option value="weekly">Weekly reminders</option>
            <option value="monthly">Monthly reminders</option>
          </select>
          <p id="reminder-frequency-description" className="mt-1 text-sm text-gray-500">
            Choose how often you want to be reminded about pending tasks
          </p>
        </div>
      </fieldset>

      {/* Notification Channels */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium text-gray-900">Notification Channels</legend>
        <p className="text-sm text-gray-600 mb-4">
          Select which channels you'd like to receive notifications through
        </p>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="browser-notifications"
                checked={notificationChannels.browser}
                onChange={(e) => handleChannelToggle('browser', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded focus:outline-none"
                aria-describedby="browser-notifications-description"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="browser-notifications" className="text-sm font-medium text-gray-700">
                Browser notifications
              </label>
              <p id="browser-notifications-description" className="text-sm text-gray-500">
                Show notifications in your browser when the app is open
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="email-notifications"
                checked={notificationChannels.email}
                onChange={(e) => handleChannelToggle('email', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded focus:outline-none"
                aria-describedby="email-notifications-description"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700">
                Email notifications
              </label>
              <p id="email-notifications-description" className="text-sm text-gray-500">
                Receive notifications via email to your registered address
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="push-notifications"
                checked={notificationChannels.push}
                onChange={(e) => handleChannelToggle('push', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded focus:outline-none"
                aria-describedby="push-notifications-description"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="push-notifications" className="text-sm font-medium text-gray-700">
                Push notifications
              </label>
              <p id="push-notifications-description" className="text-sm text-gray-500">
                Get push notifications on your device even when the app is closed
              </p>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Reminder Types */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium text-gray-900">Reminder Types</legend>
        <p className="text-sm text-gray-600 mb-4">
          Choose what types of reminders you want to receive
        </p>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="deadline-alerts"
                checked={settings.deadlineAlerts}
                onChange={(e) => handleReminderToggle('deadlineAlerts', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded focus:outline-none"
                aria-describedby="deadline-alerts-description"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="deadline-alerts" className="text-sm font-medium text-gray-700">
                Deadline alerts
              </label>
              <p id="deadline-alerts-description" className="text-sm text-gray-500">
                Get notified when task deadlines are approaching
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="team-updates"
                checked={settings.teamUpdates}
                onChange={(e) => handleReminderToggle('teamUpdates', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded focus:outline-none"
                aria-describedby="team-updates-description"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="team-updates" className="text-sm font-medium text-gray-700">
                Team collaboration updates
              </label>
              <p id="team-updates-description" className="text-sm text-gray-500">
                Stay informed about team member activity and shared project changes
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="template-sharing"
                checked={settings.templateSharing}
                onChange={(e) => handleReminderToggle('templateSharing', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded focus:outline-none"
                aria-describedby="template-sharing-description"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="template-sharing" className="text-sm font-medium text-gray-700">
                Template sharing notifications
              </label>
              <p id="template-sharing-description" className="text-sm text-gray-500">
                Get notified when templates are shared with you or when yours are used
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="audit-log-changes"
                checked={settings.auditLogChanges}
                onChange={(e) => handleReminderToggle('auditLogChanges', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded focus:outline-none"
                aria-describedby="audit-log-changes-description"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="audit-log-changes" className="text-sm font-medium text-gray-700">
                Audit log changes
              </label>
              <p id="audit-log-changes-description" className="text-sm text-gray-500">
                Receive notifications about important changes to audit logs and compliance
              </p>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

const ExportSettings: React.FC<{
  settings: AppSettings['export'];
  onUpdate: (key: string, value: any) => void;
}> = ({ settings, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Configure default export options and formats
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Export Format
        </label>
        <select
          value={settings.defaultFormat}
          onChange={(e) => onUpdate('defaultFormat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="PDF">PDF</option>
          <option value="Excel">Excel</option>
          <option value="CSV">CSV</option>
          <option value="JSON">JSON</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compression Level
        </label>
        <select
          value={settings.compressionLevel}
          onChange={(e) => onUpdate('compressionLevel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="none">None</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="include-media"
          checked={settings.includeMedia}
          onChange={(e) => onUpdate('includeMedia', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="include-media" className="ml-2 block text-sm text-gray-700">
          Include media attachments
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="include-timestamps"
          checked={settings.includeTimestamps}
          onChange={(e) => onUpdate('includeTimestamps', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="include-timestamps" className="ml-2 block text-sm text-gray-700">
          Include timestamps
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="include-comments"
          checked={settings.includeComments}
          onChange={(e) => onUpdate('includeComments', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="include-comments" className="ml-2 block text-sm text-gray-700">
          Include comments and notes
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="include-audit-log"
          checked={settings.includeAuditLog}
          onChange={(e) => onUpdate('includeAuditLog', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="include-audit-log" className="ml-2 block text-sm text-gray-700">
          Include audit log
        </label>
      </div>
    </div>
  </div>
);

const PrivacySettings: React.FC<{
  settings: AppSettings['privacy'];
  onUpdate: (key: string, value: any) => void;
}> = ({ settings, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Control data sharing and privacy preferences
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Data Retention Period
      </label>
      <select
        value={settings.dataRetentionPeriod}
        onChange={(e) => onUpdate('dataRetentionPeriod', parseInt(e.target.value))}
        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value={30}>30 days</option>
        <option value={90}>90 days</option>
        <option value={180}>180 days</option>
        <option value={365}>1 year</option>
        <option value={730}>2 years</option>
        <option value={-1}>Never delete</option>
      </select>
    </div>

    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="share-usage-data"
          checked={settings.shareUsageData}
          onChange={(e) => onUpdate('shareUsageData', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="share-usage-data" className="ml-2 block text-sm text-gray-700">
          Share anonymous usage data to improve the app
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="share-error-reports"
          checked={settings.shareErrorReports}
          onChange={(e) => onUpdate('shareErrorReports', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="share-error-reports" className="ml-2 block text-sm text-gray-700">
          Share error reports for debugging
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enable-analytics"
          checked={settings.enableAnalytics}
          onChange={(e) => onUpdate('enableAnalytics', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enable-analytics" className="ml-2 block text-sm text-gray-700">
          Enable analytics tracking
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="require-consent"
          checked={settings.requireConsentForTemplateSharing}
          onChange={(e) => onUpdate('requireConsentForTemplateSharing', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="require-consent" className="ml-2 block text-sm text-gray-700">
          Require consent before sharing templates
        </label>
      </div>
    </div>
  </div>
);

const AdvancedSettings: React.FC<{
  settings: AppSettings['advanced'];
  onUpdate: (key: string, value: any) => void;
}> = ({ settings, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Advanced configuration options for power users
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Undo Steps
        </label>
        <input
          type="number"
          value={settings.maxUndoSteps}
          onChange={(e) => onUpdate('maxUndoSteps', parseInt(e.target.value) || 50)}
          min="10"
          max="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cache Size (MB)
        </label>
        <input
          type="number"
          value={settings.cacheSize}
          onChange={(e) => onUpdate('cacheSize', parseInt(e.target.value) || 100)}
          min="10"
          max="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Custom CSS
      </label>
      <textarea
        value={settings.customCSS}
        onChange={(e) => onUpdate('customCSS', e.target.value)}
        placeholder="/* Add your custom CSS here */"
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
      />
      <p className="text-xs text-gray-500 mt-1">
        Warning: Custom CSS can affect app functionality. Use with caution.
      </p>
    </div>

    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="developer-mode"
          checked={settings.enableDeveloperMode}
          onChange={(e) => onUpdate('enableDeveloperMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="developer-mode" className="ml-2 block text-sm text-gray-700">
          Enable developer mode
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="experimental-features"
          checked={settings.enableExperimentalFeatures}
          onChange={(e) => onUpdate('enableExperimentalFeatures', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="experimental-features" className="ml-2 block text-sm text-gray-700">
          Enable experimental features
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="debug-mode"
          checked={settings.enableDebugMode}
          onChange={(e) => onUpdate('enableDebugMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="debug-mode" className="ml-2 block text-sm text-gray-700">
          Enable debug mode
        </label>
      </div>
    </div>
  </div>
);

export default SettingsManager;
