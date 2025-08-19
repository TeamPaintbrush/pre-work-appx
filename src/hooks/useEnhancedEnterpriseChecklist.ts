// Enterprise-Enhanced Checklist Hook
// Extends existing checklist functionality with enterprise features

import { useState, useEffect, useCallback } from 'react';
import { useEnterpriseContext } from '../components/Enterprise/EnterpriseProvider';
import { ChecklistItem, ChecklistSection } from '../types';
import { CustomFieldValue } from '../types/enterprise';

interface EnhancedChecklistItem extends ChecklistItem {
  customFieldValues?: CustomFieldValue[];
  workflowStatus?: string;
  timeTracking?: {
    estimated: number;
    logged: number;
    sessions: Array<{
      startTime: Date;
      endTime?: Date;
      duration: number;
    }>;
  };
  enterpriseMetadata?: {
    projectId?: string;
    assigneeId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  };
}

interface EnhancedChecklistSection extends ChecklistSection {
  items: EnhancedChecklistItem[];
}

export function useEnhancedEnterpriseChecklist(initialChecklist: any) {
  const enterpriseContext = useEnterpriseContext();
  const [checklist, setChecklist] = useState(initialChecklist);
  const [customFieldData, setCustomFieldData] = useState<Record<string, any>>({});
  const [timeTrackingActive, setTimeTrackingActive] = useState<string | null>(null);

  // Enhance existing checklist items with enterprise data
  const enhanceChecklistWithEnterpriseData = useCallback((originalChecklist: any) => {
    if (!enterpriseContext || !enterpriseContext.customFields.length) {
      return originalChecklist;
    }

    // Add custom field values to existing items without changing structure
    const enhancedSections = originalChecklist.sections?.map((section: any) => ({
      ...section,
      items: section.items?.map((item: any) => ({
        ...item,
        // Enterprise enhancements (hidden from UI unless specifically accessed)
        _enterprise: {
          customFieldValues: customFieldData[item.id] || [],
          workflowStatus: 'pending',
          timeTracking: {
            estimated: 0,
            logged: 0,
            sessions: [],
          },
          metadata: {
            assigneeId: null,
            priority: 'medium',
            tags: [],
          }
        }
      }))
    }));

    return {
      ...originalChecklist,
      sections: enhancedSections,
      _enterpriseWorkspaceId: enterpriseContext.workspaceId,
    };
  }, [enterpriseContext, customFieldData]);

  // Custom field management (works silently in background)
  const updateCustomFieldValue = useCallback((itemId: string, fieldId: string, value: any) => {
    if (!enterpriseContext?.isFeatureEnabled('customFields')) return;

    setCustomFieldData(prev => ({
      ...prev,
      [itemId]: [
        ...(prev[itemId] || []).filter((field: any) => field.fieldId !== fieldId),
        {
          fieldId,
          value,
          updatedAt: new Date(),
          updatedBy: 'current-user',
        }
      ]
    }));
  }, [enterpriseContext]);

  // Time tracking (works silently)
  const startTimeTracking = useCallback((itemId: string) => {
    if (!enterpriseContext?.isFeatureEnabled('timeTracking')) return;
    
    setTimeTrackingActive(itemId);
    // Store start time in localStorage or state
    if (typeof window !== 'undefined') {
      localStorage.setItem(`timetrack-${itemId}`, new Date().toISOString());
    }
  }, [enterpriseContext]);

  const stopTimeTracking = useCallback((itemId: string) => {
    if (!timeTrackingActive || timeTrackingActive !== itemId) return;

    setTimeTrackingActive(null);
    
    if (typeof window !== 'undefined') {
      const startTime = localStorage.getItem(`timetrack-${itemId}`);
      if (startTime) {
        const duration = (new Date().getTime() - new Date(startTime).getTime()) / 1000 / 60; // minutes
        console.log(`Time logged for ${itemId}: ${Math.round(duration)} minutes`);
        localStorage.removeItem(`timetrack-${itemId}`);
        
        // Could save to AWS here
        // await TimeTrackingService.logSession(itemId, duration);
      }
    }
  }, [timeTrackingActive]);

  // Auto-save enterprise data when checklist changes
  useEffect(() => {
    if (enterpriseContext?.workspaceId && checklist) {
      // Could auto-save to AWS here
      console.log('Enterprise data auto-save:', {
        workspaceId: enterpriseContext.workspaceId,
        customFields: Object.keys(customFieldData).length,
        timeTracking: timeTrackingActive ? 'active' : 'inactive'
      });
    }
  }, [checklist, customFieldData, timeTrackingActive, enterpriseContext]);

  // Enhance the checklist with enterprise data
  const enhancedChecklist = enhanceChecklistWithEnterpriseData(checklist);

  return {
    // Return all original functionality
    checklist: enhancedChecklist,
    setChecklist,
    
    // Add enterprise functionality (available but not required)
    enterpriseFeatures: {
      customFieldData,
      updateCustomFieldValue,
      timeTrackingActive,
      startTimeTracking,
      stopTimeTracking,
      isEnterpriseEnabled: !!enterpriseContext,
      workspaceId: enterpriseContext?.workspaceId,
      availableCustomFields: enterpriseContext?.customFields || [],
    }
  };
}
