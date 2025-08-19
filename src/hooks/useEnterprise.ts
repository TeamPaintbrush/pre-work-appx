// Enterprise React Hooks
// Custom hooks for enterprise features that maintain existing UI

import { useState, useEffect, useCallback } from 'react';
import { 
  Workspace, 
  CustomField, 
  Workflow, 
  BoardConfiguration,
  ViewType,
  EnterpriseProject,
  EnterpriseTask 
} from '../types/enterprise';

// ===== WORKSPACE HOOKS =====

export function useWorkspaces(userId: string) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/enterprise/workspaces?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setWorkspaces(result.data);
      } else {
        setError(result.error || 'Failed to fetch workspaces');
      }
    } catch (err) {
      setError('Network error while fetching workspaces');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const createWorkspace = useCallback(async (workspaceData: {
    name: string;
    description?: string;
    ownerId: string;
  }) => {
    try {
      const response = await fetch('/api/enterprise/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspaceData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setWorkspaces(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create workspace');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
      throw err;
    }
  }, []);

  return {
    workspaces,
    loading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
  };
}

export function useCurrentWorkspace(workspaceId: string | null) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchWorkspace = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/enterprise/workspaces/${workspaceId}`);
        const result = await response.json();
        
        if (result.success) {
          setWorkspace(result.data);
        } else {
          setError(result.error || 'Failed to fetch workspace');
        }
      } catch (err) {
        setError('Network error while fetching workspace');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  return { workspace, loading, error };
}

// ===== CUSTOM FIELDS HOOKS =====

export function useCustomFields(workspaceId: string | null) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomFields = useCallback(async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/enterprise/custom-fields?workspaceId=${workspaceId}`);
      const result = await response.json();
      
      if (result.success) {
        setCustomFields(result.data);
      } else {
        setError(result.error || 'Failed to fetch custom fields');
      }
    } catch (err) {
      setError('Network error while fetching custom fields');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchCustomFields();
  }, [fetchCustomFields]);

  const createCustomField = useCallback(async (fieldData: {
    workspaceId: string;
    name: string;
    type: string;
    description?: string;
    applicableToTypes: string[];
  }) => {
    try {
      const response = await fetch('/api/enterprise/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCustomFields(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create custom field');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom field');
      throw err;
    }
  }, []);

  return {
    customFields,
    loading,
    error,
    refetch: fetchCustomFields,
    createCustomField,
  };
}

// ===== VIEW MANAGEMENT HOOKS =====

export function useViewConfiguration(workspaceId: string | null) {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [availableViews, setAvailableViews] = useState<ViewType[]>(['list', 'kanban', 'calendar']);
  const [boardConfigs, setBoardConfigs] = useState<BoardConfiguration[]>([]);

  // This hook manages view state without changing existing UI
  // It just extends the data layer for future view implementations
  
  const switchView = useCallback((newView: ViewType) => {
    if (availableViews.includes(newView)) {
      setCurrentView(newView);
      // Store preference in localStorage or user settings
      if (typeof window !== 'undefined') {
        localStorage.setItem(`workspace-${workspaceId}-view`, newView);
      }
    }
  }, [availableViews, workspaceId]);

  const isViewAvailable = useCallback((view: ViewType) => {
    return availableViews.includes(view);
  }, [availableViews]);

  // Load saved view preference
  useEffect(() => {
    if (workspaceId && typeof window !== 'undefined') {
      const savedView = localStorage.getItem(`workspace-${workspaceId}-view`) as ViewType;
      if (savedView && availableViews.includes(savedView)) {
        setCurrentView(savedView);
      }
    }
  }, [workspaceId, availableViews]);

  return {
    currentView,
    availableViews,
    boardConfigs,
    switchView,
    isViewAvailable,
  };
}

// ===== ENTERPRISE PROJECT HOOKS =====

export function useEnterpriseProjects(workspaceId: string | null) {
  const [projects, setProjects] = useState<EnterpriseProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This extends your existing project system with enterprise features
  // Without breaking current functionality
  
  const fetchProjects = useCallback(async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/enterprise/projects?workspaceId=${workspaceId}`);
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
      } else {
        setError(result.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('Network error while fetching projects');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}

// ===== SYNC & REAL-TIME HOOKS =====

export function useRealTimeSync(workspaceId: string | null) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Real-time sync capabilities for cross-device functionality
  // Prepares for future mobile/desktop sync without affecting current UI
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = useCallback(async () => {
    if (!workspaceId || !isOnline) return;
    
    setSyncStatus('syncing');
    
    try {
      // Future: Implement actual sync logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
      setLastSync(new Date());
      setSyncStatus('idle');
    } catch (error) {
      setSyncStatus('error');
    }
  }, [workspaceId, isOnline]);

  return {
    isOnline,
    syncStatus,
    lastSync,
    triggerSync,
  };
}

// ===== UTILITY HOOKS =====

export function useEnterpriseFeatures(workspaceId: string | null) {
  const { workspace } = useCurrentWorkspace(workspaceId);
  const { customFields } = useCustomFields(workspaceId);
  const { currentView, availableViews } = useViewConfiguration(workspaceId);
  const { isOnline, syncStatus } = useRealTimeSync(workspaceId);

  // Provides a unified interface to all enterprise features
  // Makes it easy to gradually expose features in your existing UI
  
  const isFeatureEnabled = useCallback((feature: string) => {
    if (!workspace) return false;
    
    switch (feature) {
      case 'customFields':
        return customFields.length > 0;
      case 'multipleViews':
        return availableViews.length > 1;
      case 'timeTracking':
        return workspace.settings.timeTracking;
      case 'realTimeSync':
        return isOnline;
      default:
        return false;
    }
  }, [workspace, customFields, availableViews, isOnline]);

  const getFeatureConfig = useCallback((feature: string) => {
    if (!workspace) return null;
    
    switch (feature) {
      case 'notifications':
        return workspace.settings.notifications;
      case 'integrations':
        return workspace.settings.integrations;
      case 'security':
        return workspace.settings.security;
      default:
        return null;
    }
  }, [workspace]);

  return {
    workspace,
    customFields,
    currentView,
    availableViews,
    syncStatus,
    isFeatureEnabled,
    getFeatureConfig,
  };
}
