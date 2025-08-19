// Enhanced Checklist Overlay - Adds advanced features without changing base UI
// Renders over existing checklist to add comments, time tracking, etc.

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFeature, FeatureGate } from './FeatureToggleProvider';
import { useCurrentWorkspace } from '../../hooks/useEnterprise';
import { ChecklistItem, ChecklistTemplate } from '../../types';

interface ChecklistEnhancementOverlayProps {
  checklist: ChecklistTemplate;
  items?: ChecklistItem[]; // Make items optional
  onItemUpdate?: (itemId: string, updates: Partial<ChecklistItem>) => void;
  className?: string;
}

export function ChecklistEnhancementOverlay({ 
  checklist, 
  items = [], // Default to empty array to prevent undefined errors
  onItemUpdate,
  className = '' 
}: ChecklistEnhancementOverlayProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const { workspace } = useCurrentWorkspace(null);

  // Feature flags
  const commentsEnabled = useFeature('enableComments');
  const timeTrackingEnabled = useFeature('enableTimeTracking');
  const fileSharingEnabled = useFeature('enableFileSharing');
  const mentionsEnabled = useFeature('enableMentions');

  // Quick actions for each checklist item
  const renderItemEnhancements = (item: ChecklistItem) => {
    if (!selectedItemId || selectedItemId !== item.id) return null;

    return (
      <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-64">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Quick Actions</span>
          <button
            onClick={() => setSelectedItemId(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2">
          <FeatureGate feature="enableComments">
            <button
              onClick={() => setShowComments(true)}
              className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              💬 Add Comment
            </button>
          </FeatureGate>
          
          <FeatureGate feature="enableTimeTracking">
            <button
              onClick={() => toggleTimer(item.id)}
              className={`w-full text-left px-2 py-1 text-sm rounded ${
                activeTimer === item.id 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              {activeTimer === item.id ? '⏹️ Stop Timer' : '⏱️ Start Timer'}
            </button>
          </FeatureGate>
          
          <FeatureGate feature="enableFileSharing">
            <button
              onClick={() => handleFileAttachment(item.id)}
              className="w-full text-left px-2 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded"
            >
              📎 Attach File
            </button>
          </FeatureGate>
          
          <FeatureGate feature="enableMentions">
            <button
              onClick={() => handleMention(item.id)}
              className="w-full text-left px-2 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded"
            >
              @️ Mention Someone
            </button>
          </FeatureGate>
        </div>
      </div>
    );
  };

  // Timer functionality
  const toggleTimer = (itemId: string) => {
    if (activeTimer === itemId) {
      setActiveTimer(null);
      // Stop timer logic here
      console.log('Stopping timer for item:', itemId);
    } else {
      setActiveTimer(itemId);
      // Start timer logic here
      console.log('Starting timer for item:', itemId);
    }
  };

  // File attachment handler
  const handleFileAttachment = (itemId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log('Attaching files to item:', itemId, files);
        // File upload logic here
      }
    };
    input.click();
  };

  // Mention handler
  const handleMention = (itemId: string) => {
    console.log('Opening mention dialog for item:', itemId);
    // Mention logic here
  };

  // Floating action buttons for active features
  const renderFloatingActions = () => {
    const enabledFeatures = [];
    
    if (commentsEnabled) enabledFeatures.push('comments');
    if (timeTrackingEnabled) enabledFeatures.push('time');
    if (fileSharingEnabled) enabledFeatures.push('files');
    
    if (enabledFeatures.length === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-40">
        <FeatureGate feature="enableComments">
          <button
            onClick={() => setShowComments(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all"
            title="View Comments"
          >
            💬
          </button>
        </FeatureGate>
        
        <FeatureGate feature="enableTimeTracking">
          <button
            onClick={() => setShowTimeTracker(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all"
            title="Time Tracking"
          >
            ⏱️
          </button>
        </FeatureGate>
      </div>
    );
  };

  // Comments panel
  const renderCommentsPanel = () => {
    if (!showComments) return null;

    return (
      <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Comments</h3>
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="text-sm text-gray-500 text-center py-8">
              No comments yet. Add the first comment!
            </div>
            
            <div className="border-t pt-4">
              <textarea
                placeholder="Add a comment..."
                className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                rows={3}
              />
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Time tracking panel
  const renderTimeTrackingPanel = () => {
    if (!showTimeTracker) return null;

    return (
      <div className="fixed bottom-20 right-4 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Time Tracking</h3>
            <button
              onClick={() => setShowTimeTracker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-center">
            <div className="text-2xl font-mono text-gray-900 mb-2">
              {activeTimer ? '00:15:23' : '00:00:00'}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => toggleTimer('global')}
                className={`px-4 py-2 rounded-lg ${
                  activeTimer 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {activeTimer ? 'Stop' : 'Start'}
              </button>
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
                Reset
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Today:</span>
              <span>2h 45m</span>
            </div>
            <div className="flex justify-between">
              <span>This week:</span>
              <span>18h 20m</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Non-intrusive item indicators
  const renderItemIndicators = (item: ChecklistItem) => {
    const indicators = [];
    
    if (commentsEnabled && hasComments(item.id)) {
      indicators.push(
        <span key="comments" className="inline-flex items-center text-blue-500 text-xs ml-2">
          💬 2
        </span>
      );
    }
    
    if (timeTrackingEnabled && hasTimeTracking(item.id)) {
      indicators.push(
        <span key="time" className="inline-flex items-center text-green-500 text-xs ml-2">
          ⏱️ 45m
        </span>
      );
    }
    
    if (fileSharingEnabled && hasAttachments(item.id)) {
      indicators.push(
        <span key="files" className="inline-flex items-center text-purple-500 text-xs ml-2">
          📎 3
        </span>
      );
    }
    
    return indicators.length > 0 ? (
      <div className="inline-flex items-center">
        {indicators}
      </div>
    ) : null;
  };

  // Utility functions
  const hasComments = (itemId: string) => false; // Would check actual data
  const hasTimeTracking = (itemId: string) => activeTimer === itemId;
  const hasAttachments = (itemId: string) => false; // Would check actual data

  return (
    <>
      {/* Invisible overlay to detect clicks and add enhancement points */}
      <div className={`relative ${className}`}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group"
            onMouseEnter={() => setSelectedItemId(item.id)}
            onMouseLeave={() => setSelectedItemId(null)}
          >
            {/* Enhancement trigger button - only visible on hover */}
            {selectedItemId === item.id && (
              <button
                className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemId(selectedItemId === item.id ? null : item.id);
                }}
              >
                ⚡
              </button>
            )}
            
            {/* Item indicators */}
            {renderItemIndicators(item)}
            
            {/* Enhancement menu */}
            {renderItemEnhancements(item)}
          </div>
        ))}
      </div>

      {/* Floating action buttons */}
      {renderFloatingActions()}

      {/* Side panels */}
      {renderCommentsPanel()}
      {renderTimeTrackingPanel()}
    </>
  );
}

// Hook for managing checklist enhancements
export function useChecklistEnhancements(checklistId: string) {
  const [comments, setComments] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  // Load enhancement data
  useEffect(() => {
    // Load comments, time entries, attachments for this checklist
  }, [checklistId]);

  return {
    comments,
    timeEntries,
    attachments,
    addComment: (itemId: string, comment: string) => {},
    startTimer: (itemId: string) => {},
    stopTimer: (itemId: string) => {},
    addAttachment: (itemId: string, file: File) => {},
  };
}
