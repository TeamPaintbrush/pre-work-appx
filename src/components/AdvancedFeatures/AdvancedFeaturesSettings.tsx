// Advanced Features Settings Panel
// Non-intrusive settings to control feature visibility

'use client';

import React, { useState } from 'react';
import { useFeatureToggle, FeatureGate } from './FeatureToggleProvider';

interface AdvancedFeaturesSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedFeaturesSettings({ isOpen, onClose }: AdvancedFeaturesSettingsProps) {
  const { 
    features, 
    updateFeature, 
    enabledFeaturesCount, 
    toggleAdvancedMode, 
    isAdvancedMode 
  } = useFeatureToggle();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'collaboration' | 'project' | 'automation' | 'communication'>('overview');

  if (!isOpen) return null;

  const featureCategories = {
    collaboration: [
      { key: 'enableComments', label: 'Comments & Discussions', description: 'Add threaded comments to any checklist item' },
      { key: 'enableFileSharing', label: 'File Attachments', description: 'Attach files and images to checklist items' },
      { key: 'enableMentions', label: '@Mentions', description: 'Mention team members in comments and discussions' },
      { key: 'enableActivityFeed', label: 'Activity Feed', description: 'Track all changes and updates in real-time' },
      { key: 'enableRealTimeCollab', label: 'Real-time Collaboration', description: 'See live cursors and instant updates' },
    ],
    project: [
      { key: 'enableGoals', label: 'Goals & OKRs', description: 'Set and track measurable objectives' },
      { key: 'enableTimeTracking', label: 'Time Tracking', description: 'Built-in timer and productivity analytics' },
      { key: 'enableResourceManagement', label: 'Resource Planning', description: 'Manage team capacity and workload' },
      { key: 'enableProjectTemplates', label: 'Project Templates', description: 'Reusable checklist templates and workflows' },
      { key: 'enableMilestones', label: 'Milestones', description: 'Track key deliverables and deadlines' },
    ],
    automation: [
      { key: 'enableAutomation', label: 'Smart Automation', description: 'Automate repetitive tasks and workflows' },
      { key: 'enableWorkflows', label: 'Custom Workflows', description: 'Create multi-step automated processes' },
      { key: 'enableIntegrations', label: 'External Integrations', description: 'Connect with other tools and services' },
      { key: 'enableSmartSuggestions', label: 'AI Suggestions', description: 'Get intelligent recommendations for improvements' },
    ],
    communication: [
      { key: 'enableMessaging', label: 'Team Messaging', description: 'Built-in chat and communication tools' },
      { key: 'enableVideoCalls', label: 'Video Conferencing', description: 'Start video calls directly from checklists' },
      { key: 'enableWhiteboards', label: 'Interactive Whiteboards', description: 'Collaborative drawing and planning tools' },
      { key: 'enableKnowledgeBase', label: 'Knowledge Base', description: 'Centralized documentation and wiki' },
      { key: 'enableAdvancedSearch', label: 'Advanced Search', description: 'Powerful search across all content' },
    ],
  };

  const uiFeatures = [
    { key: 'enableAdvancedAnalytics', label: 'Advanced Analytics', description: 'Detailed insights and reporting dashboards' },
    { key: 'enableBulkOperations', label: 'Bulk Operations', description: 'Select and modify multiple items at once' },
    { key: 'enableKeyboardShortcuts', label: 'Keyboard Shortcuts', description: 'Speed up your workflow with hotkeys' },
    { key: 'enableAdvancedFilters', label: 'Advanced Filters', description: 'Powerful filtering and sorting options' },
    { key: 'enableCustomFields', label: 'Custom Fields', description: 'Add custom metadata to checklist items' },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isAdvancedMode ? 'Advanced Mode Enabled' : 'Standard Mode'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {isAdvancedMode 
            ? `You have ${enabledFeaturesCount} advanced features enabled.`
            : 'Enable advanced mode to unlock powerful enterprise features.'
          }
        </p>
        
        <button
          onClick={toggleAdvancedMode}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isAdvancedMode
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isAdvancedMode ? 'Customize Features' : 'Enable Advanced Mode'}
        </button>
      </div>

      {isAdvancedMode && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Collaboration</h4>
            <p className="text-sm text-blue-700">
              {featureCategories.collaboration.filter(f => features[f.key as keyof typeof features]).length} / {featureCategories.collaboration.length} enabled
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-1">Project Management</h4>
            <p className="text-sm text-green-700">
              {featureCategories.project.filter(f => features[f.key as keyof typeof features]).length} / {featureCategories.project.length} enabled
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-1">Automation</h4>
            <p className="text-sm text-purple-700">
              {featureCategories.automation.filter(f => features[f.key as keyof typeof features]).length} / {featureCategories.automation.length} enabled
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-1">Communication</h4>
            <p className="text-sm text-orange-700">
              {featureCategories.communication.filter(f => features[f.key as keyof typeof features]).length} / {featureCategories.communication.length} enabled
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderFeatureCategory = (categoryKey: keyof typeof featureCategories) => (
    <div className="space-y-4">
      {featureCategories[categoryKey].map((feature) => (
        <div key={feature.key} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            id={feature.key}
            checked={features[feature.key as keyof typeof features]}
            onChange={(e) => updateFeature(feature.key as keyof typeof features, e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor={feature.key} className="block text-sm font-medium text-gray-900 cursor-pointer">
              {feature.label}
            </label>
            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUIFeaturesTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">User Interface Enhancements</h3>
      {uiFeatures.map((feature) => (
        <div key={feature.key} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            id={feature.key}
            checked={features[feature.key as keyof typeof features]}
            onChange={(e) => updateFeature(feature.key as keyof typeof features, e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor={feature.key} className="block text-sm font-medium text-gray-900 cursor-pointer">
              {feature.label}
            </label>
            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Advanced Features</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Customize which advanced features are visible in your workspace
          </p>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📊 Overview
              </button>
              
              <button
                onClick={() => setActiveTab('collaboration')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'collaboration'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                👥 Collaboration
              </button>
              
              <button
                onClick={() => setActiveTab('project')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'project'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📋 Project Management
              </button>
              
              <button
                onClick={() => setActiveTab('automation')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'automation'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                ⚡ Automation
              </button>
              
              <button
                onClick={() => setActiveTab('communication')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'communication'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                💬 Communication
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'collaboration' && renderFeatureCategory('collaboration')}
            {activeTab === 'project' && renderFeatureCategory('project')}
            {activeTab === 'automation' && renderFeatureCategory('automation')}
            {activeTab === 'communication' && renderFeatureCategory('communication')}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {enabledFeaturesCount} features enabled
            </div>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
