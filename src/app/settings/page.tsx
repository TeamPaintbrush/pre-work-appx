'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SettingsManager, { AppSettings } from '../../components/Settings/SettingsManager';
import ProductionSettings from '../../components/Settings/ProductionSettings';
import MonitoringSettings from '../../components/Settings/MonitoringSettings';
import { IntegrationHub } from '../../components/Integrations/IntegrationHub';

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

const SettingsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'accessibility' | 'notifications' | 'export' | 'privacy' | 'integrations' | 'monitoring' | 'production' | 'security'>('general');

  // Handle navigation tab from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['general', 'accessibility', 'notifications', 'export', 'privacy', 'integrations', 'monitoring', 'production', 'security'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('preWorkAppSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('preWorkAppSettings', JSON.stringify(newSettings));
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('preWorkAppSettings');
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pre-work-app-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedSettings = JSON.parse(result);
          setSettings(importedSettings);
          localStorage.setItem('preWorkAppSettings', JSON.stringify(importedSettings));
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: '⚙️' },
    { id: 'production', label: 'Production', icon: '🚀' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
  ];

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-900">SSL Certificate</span>
            </div>
            <p className="text-sm text-green-700">Valid until Dec 2025</p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-900">HTTPS Encryption</span>
            </div>
            <p className="text-sm text-green-700">TLS 1.3 Active</p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium text-yellow-900">Security Headers</span>
            </div>
            <p className="text-sm text-yellow-700">Some headers missing</p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Enable 2FA
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Session Management</h4>
              <p className="text-sm text-gray-600">Manage active sessions and logout options</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Logout All Devices
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">API Keys</h4>
              <p className="text-sm text-gray-600">Manage API keys for integrations</p>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Manage Keys
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Successful login from new device</p>
              <p className="text-xs text-green-700">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Password updated</p>
              <p className="text-xs text-blue-700">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">Failed login attempt</p>
              <p className="text-xs text-yellow-700">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your application preferences and configurations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
                <SettingsManager
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onResetSettings={handleResetSettings}
                  onExportSettings={handleExportSettings}
                  onImportSettings={handleImportSettings}
                />
              </div>
            )}
            
            {activeTab === 'production' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Production Management</h2>
                <ProductionSettings />
              </div>
            )}
            
            {activeTab === 'monitoring' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">System Monitoring</h2>
                <MonitoringSettings />
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security & Access</h2>
                {renderSecurityTab()}
              </div>
            )}
            
            {activeTab === 'integrations' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Third-Party Integrations</h2>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Integration Hub:</strong> Connect your Pre-Work App with external services like Slack, Microsoft Teams, Google Drive, and more. Manage webhooks, SSO, and API integrations from this centralized hub.
                  </p>
                </div>
                <IntegrationHub className="border-0 shadow-none bg-transparent p-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading settings...</p>
      </div>
    </div>}>
      <SettingsContent />
    </Suspense>
  );
};

export default SettingsPage;
