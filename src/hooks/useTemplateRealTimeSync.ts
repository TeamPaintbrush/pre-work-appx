import { useState, useEffect, useCallback } from 'react';
import { ChecklistTemplate } from '../types';
import { templateRealTimeSyncService, SyncStatus, SyncEvent } from '../services/aws/TemplateRealTimeSyncService';
import { TemplateFilter } from '../services/aws/AWSTemplateService';

/**
 * REAL-TIME TEMPLATE SYNC HOOK
 * React hook for integrating real-time template synchronization
 * Provides seamless AWS integration with offline support
 */

export interface UseTemplateRealTimeSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  enableOfflineMode?: boolean;
}

export interface UseTemplateRealTimeSyncReturn {
  // Template operations
  templates: ChecklistTemplate[];
  saveTemplate: (template: ChecklistTemplate, userId: string) => Promise<void>;
  updateTemplate: (templateId: string, updates: Partial<ChecklistTemplate>, userId: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  getTemplates: (filter?: TemplateFilter) => Promise<ChecklistTemplate[]>;
  
  // Sync status and control
  syncStatus: SyncStatus;
  triggerSync: () => Promise<void>;
  enableAutoSync: (enabled: boolean) => void;
  setSyncInterval: (intervalMs: number) => void;
  
  // Offline support
  pendingChangesCount: number;
  clearPendingChanges: () => void;
  resolveConflicts: () => Promise<void>;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useTemplateRealTimeSync = (
  options: UseTemplateRealTimeSyncOptions = {}
): UseTemplateRealTimeSyncReturn => {
  const {
    autoSync = true,
    syncInterval = 30000,
    enableOfflineMode = true
  } = options;

  // State management
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(templateRealTimeSyncService.getSyncStatus());
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize sync service and event listeners
  useEffect(() => {
    // Configure sync service
    templateRealTimeSyncService.setAutoSyncEnabled(autoSync);
    templateRealTimeSyncService.setSyncInterval(syncInterval);

    // Subscribe to sync events
    const unsubscribe = templateRealTimeSyncService.onSyncEvent((event: SyncEvent) => {
      console.log('Sync event received:', event);
      
      switch (event.type) {
        case 'template_created':
          if (event.template) {
            setTemplates(prev => {
              const exists = prev.find(t => t.id === event.template!.id);
              if (!exists) {
                return [...prev, event.template!];
              }
              return prev;
            });
          }
          break;
          
        case 'template_updated':
          if (event.template) {
            setTemplates(prev => prev.map(t => 
              t.id === event.template!.id ? event.template! : t
            ));
          }
          break;
          
        case 'template_deleted':
          if (event.templateId) {
            setTemplates(prev => prev.filter(t => t.id !== event.templateId));
          }
          break;
          
        case 'sync_complete':
          setSyncStatus(templateRealTimeSyncService.getSyncStatus());
          setPendingChangesCount(templateRealTimeSyncService.getPendingChangesCount());
          break;
          
        case 'sync_error':
          setError(event.error || 'Sync error occurred');
          setSyncStatus(templateRealTimeSyncService.getSyncStatus());
          break;
      }
    });

    // Initial sync status update
    setSyncStatus(templateRealTimeSyncService.getSyncStatus());
    setPendingChangesCount(templateRealTimeSyncService.getPendingChangesCount());

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [autoSync, syncInterval]);

  // Periodic status updates
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setSyncStatus(templateRealTimeSyncService.getSyncStatus());
      setPendingChangesCount(templateRealTimeSyncService.getPendingChangesCount());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(statusInterval);
  }, []);

  // Template operations
  const saveTemplate = useCallback(async (template: ChecklistTemplate, userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await templateRealTimeSyncService.saveTemplateWithSync(template, userId);
      
      // Update local state immediately for better UX
      setTemplates(prev => {
        const exists = prev.find(t => t.id === template.id);
        if (!exists) {
          return [...prev, template];
        }
        return prev.map(t => t.id === template.id ? template : t);
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      setError(errorMessage);
      console.error('Error saving template:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (
    templateId: string, 
    updates: Partial<ChecklistTemplate>, 
    userId: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await templateRealTimeSyncService.updateTemplateWithSync(templateId, updates, userId);
      
      // Update local state immediately
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, ...updates } : t
      ));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      console.error('Error updating template:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await templateRealTimeSyncService.deleteTemplateWithSync(templateId);
      
      // Update local state immediately
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      console.error('Error deleting template:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTemplates = useCallback(async (filter?: TemplateFilter): Promise<ChecklistTemplate[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedTemplates = await templateRealTimeSyncService.getTemplatesWithSync(filter);
      setTemplates(fetchedTemplates);
      
      return fetchedTemplates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync control
  const triggerSync = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await templateRealTimeSyncService.triggerSync();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      console.error('Error triggering sync:', err);
    }
  }, []);

  const enableAutoSync = useCallback((enabled: boolean): void => {
    templateRealTimeSyncService.setAutoSyncEnabled(enabled);
  }, []);

  const setSyncIntervalCallback = useCallback((intervalMs: number): void => {
    templateRealTimeSyncService.setSyncInterval(intervalMs);
  }, []);

  // Offline support
  const clearPendingChanges = useCallback((): void => {
    templateRealTimeSyncService.clearPendingChanges();
    setPendingChangesCount(0);
  }, []);

  const resolveConflicts = useCallback(async (): Promise<void> => {
    try {
      await templateRealTimeSyncService.resolveAllConflicts();
      setSyncStatus(templateRealTimeSyncService.getSyncStatus());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve conflicts';
      setError(errorMessage);
      console.error('Error resolving conflicts:', err);
    }
  }, []);

  // Error handling
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    // Template operations
    templates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplates,
    
    // Sync status and control
    syncStatus,
    triggerSync,
    enableAutoSync,
    setSyncInterval: setSyncIntervalCallback,
    
    // Offline support
    pendingChangesCount,
    clearPendingChanges,
    resolveConflicts,
    
    // Loading and error states
    isLoading,
    error,
    clearError
  };
};
