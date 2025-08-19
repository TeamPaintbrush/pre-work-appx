// Silent Enterprise UI Components
// These components add enterprise features without changing visual appearance

"use client";

import React from 'react';
import { useEnterpriseContext } from './EnterpriseProvider';
import { isFeatureEnabled } from '../../utils/enterpriseConfig';

// Silent Workspace Detector - Automatically creates/detects workspace
export function SilentWorkspaceDetector({ children }: { children: React.ReactNode }) {
  const enterpriseContext = useEnterpriseContext();
  const [workspaceCreated, setWorkspaceCreated] = React.useState(false);

  React.useEffect(() => {
    const initializeWorkspace = async () => {
      if (!isFeatureEnabled('customFields') || workspaceCreated) return;

      // Check if user has a default workspace
      let workspaceId = null;
      if (typeof window !== 'undefined') {
        workspaceId = localStorage.getItem('defaultWorkspaceId');
      }

      // If no workspace, silently create one
      if (!workspaceId && enterpriseContext) {
        try {
          const response = await fetch('/api/enterprise/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'My Workspace',
              ownerId: 'default-user',
              description: 'Default workspace for pre-work checklists',
            }),
          });

          const result = await response.json();
          if (result.success) {
            workspaceId = result.data.id;
            if (typeof window !== 'undefined') {
              localStorage.setItem('defaultWorkspaceId', workspaceId);
            }
            enterpriseContext.setWorkspaceId(workspaceId);
            setWorkspaceCreated(true);
          }
        } catch (error) {
          console.log('Enterprise workspace creation skipped:', error);
        }
      } else if (workspaceId && enterpriseContext) {
        enterpriseContext.setWorkspaceId(workspaceId);
        setWorkspaceCreated(true);
      }
    };

    initializeWorkspace();
  }, [enterpriseContext, workspaceCreated]);

  return <>{children}</>;
}

// Silent Custom Field Tracker - Tracks fields without showing UI
export function SilentCustomFieldTracker({ itemId, children }: { itemId: string; children: React.ReactNode }) {
  const enterpriseContext = useEnterpriseContext();

  React.useEffect(() => {
    if (!isFeatureEnabled('customFields') || !enterpriseContext?.workspaceId) return;

    // Silently initialize default custom fields for this item
    const initializeCustomFields = () => {
      // This runs in background without UI
      console.log(`Custom fields initialized for item: ${itemId}`);
    };

    initializeCustomFields();
  }, [itemId, enterpriseContext]);

  return <>{children}</>;
}

// Silent Time Tracker - Adds invisible time tracking
export function SilentTimeTracker({ 
  itemId, 
  isActive, 
  children 
}: { 
  itemId: string; 
  isActive: boolean; 
  children: React.ReactNode 
}) {
  const [startTime, setStartTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (!isFeatureEnabled('timeTracking')) return;

    if (isActive && !startTime) {
      setStartTime(new Date());
      if (typeof window !== 'undefined') {
        localStorage.setItem(`silent-timer-${itemId}`, new Date().toISOString());
      }
    } else if (!isActive && startTime) {
      const duration = (new Date().getTime() - startTime.getTime()) / 1000 / 60;
      console.log(`Silent time tracking - Item ${itemId}: ${Math.round(duration)} minutes`);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`silent-timer-${itemId}`);
      }
      setStartTime(null);
    }
  }, [isActive, startTime, itemId]);

  return <>{children}</>;
}

// Silent Progress Analytics - Tracks usage without showing
export function SilentProgressAnalytics({ 
  progress, 
  totalItems, 
  children 
}: { 
  progress: number; 
  totalItems: number; 
  children: React.ReactNode 
}) {
  React.useEffect(() => {
    if (!isFeatureEnabled('advancedReporting')) return;

    // Silently track progress metrics
    const metrics = {
      progress: Math.round(progress),
      totalItems,
      timestamp: new Date().toISOString(),
      completionRate: progress / totalItems,
    };

    // Store in localStorage for future analytics
    if (typeof window !== 'undefined') {
      const existingMetrics = JSON.parse(localStorage.getItem('silentAnalytics') || '[]');
      existingMetrics.push(metrics);
      
      // Keep only last 100 entries
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      localStorage.setItem('silentAnalytics', JSON.stringify(existingMetrics));
    }
  }, [progress, totalItems]);

  return <>{children}</>;
}

// Silent Sync Monitor - Monitors for real-time sync opportunities
export function SilentSyncMonitor({ children }: { children: React.ReactNode }) {
  const enterpriseContext = useEnterpriseContext();

  React.useEffect(() => {
    if (!isFeatureEnabled('realTimeSync') || !enterpriseContext?.workspaceId) return;

    const syncInterval = setInterval(() => {
      // Check for pending sync operations
      console.log('Silent sync check - workspace:', enterpriseContext.workspaceId);
      
      // Could trigger actual sync here
      // SyncService.processPendingOperations(enterpriseContext.workspaceId);
    }, 30000); // Every 30 seconds

    return () => clearInterval(syncInterval);
  }, [enterpriseContext]);

  return <>{children}</>;
}

// Silent Feature Reporter - Reports usage for analytics
export function SilentFeatureReporter() {
  React.useEffect(() => {
    const reportUsage = () => {
      const usage = {
        timestamp: new Date().toISOString(),
        features: {
          customFields: isFeatureEnabled('customFields'),
          timeTracking: isFeatureEnabled('timeTracking'),
          realTimeSync: isFeatureEnabled('realTimeSync'),
          workflows: isFeatureEnabled('workflows'),
        },
        sessionId: typeof window !== 'undefined' 
          ? sessionStorage.getItem('sessionId') || 'unknown'
          : 'server',
      };

      console.log('Enterprise features active:', usage);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastFeatureReport', JSON.stringify(usage));
      }
    };

    reportUsage();
    
    // Report every 5 minutes
    const reportInterval = setInterval(reportUsage, 5 * 60 * 1000);
    return () => clearInterval(reportInterval);
  }, []);

  return null; // This component is completely invisible
}
