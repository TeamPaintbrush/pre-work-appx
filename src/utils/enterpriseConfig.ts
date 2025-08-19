// Enterprise Configuration Utils
// Manages enterprise feature flags and configuration

import React from 'react';

export interface EnterpriseConfig {
  enabled: boolean;
  features: {
    customFields: boolean;
    workflows: boolean;
    multiView: boolean;
    realTimeSync: boolean;
    timeTracking: boolean;
    advancedReporting: boolean;
    integrations: boolean;
  };
  limits: {
    workspacesPerUser: number;
    customFieldsPerWorkspace: number;
    projectsPerWorkspace: number;
    usersPerWorkspace: number;
  };
  sync: {
    intervalSeconds: number;
    offlineEnabled: boolean;
    conflictResolution: 'last_write_wins' | 'manual' | 'merge';
  };
  security: {
    encryptionEnabled: boolean;
    auditLogEnabled: boolean;
    sessionTimeoutMinutes: number;
  };
}

export const getEnterpriseConfig = (): EnterpriseConfig => {
  return {
    enabled: process.env.NEXT_PUBLIC_ENTERPRISE_ENABLED === 'true',
    features: {
      customFields: process.env.NEXT_PUBLIC_CUSTOM_FIELDS_ENABLED === 'true',
      workflows: process.env.NEXT_PUBLIC_WORKFLOWS_ENABLED === 'true',
      multiView: process.env.NEXT_PUBLIC_MULTI_VIEW_ENABLED === 'true',
      realTimeSync: process.env.NEXT_PUBLIC_REAL_TIME_SYNC_ENABLED === 'true',
      timeTracking: process.env.NEXT_PUBLIC_TIME_TRACKING_ENABLED === 'true',
      advancedReporting: process.env.NEXT_PUBLIC_ADVANCED_REPORTING_ENABLED === 'true',
      integrations: process.env.NEXT_PUBLIC_INTEGRATIONS_ENABLED === 'true',
    },
    limits: {
      workspacesPerUser: parseInt(process.env.WORKSPACES_PER_USER_LIMIT || '5'),
      customFieldsPerWorkspace: parseInt(process.env.CUSTOM_FIELDS_PER_WORKSPACE_LIMIT || '50'),
      projectsPerWorkspace: parseInt(process.env.PROJECTS_PER_WORKSPACE_LIMIT || '100'),
      usersPerWorkspace: parseInt(process.env.USERS_PER_WORKSPACE_LIMIT || '50'),
    },
    sync: {
      intervalSeconds: parseInt(process.env.SYNC_INTERVAL_SECONDS || '30'),
      offlineEnabled: process.env.OFFLINE_SYNC_ENABLED === 'true',
      conflictResolution: (process.env.CONFLICT_RESOLUTION_STRATEGY as any) || 'last_write_wins',
    },
    security: {
      encryptionEnabled: process.env.ENTERPRISE_ENCRYPTION_ENABLED === 'true',
      auditLogEnabled: process.env.AUDIT_LOG_ENABLED === 'true',
      sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '480'),
    },
  };
};

export const isFeatureEnabled = (feature: keyof EnterpriseConfig['features']): boolean => {
  const config = getEnterpriseConfig();
  return config.enabled && config.features[feature];
};

export const getFeatureLimit = (limit: keyof EnterpriseConfig['limits']): number => {
  const config = getEnterpriseConfig();
  return config.limits[limit];
};

export const getSyncConfig = () => {
  const config = getEnterpriseConfig();
  return config.sync;
};

export const getSecurityConfig = () => {
  const config = getEnterpriseConfig();
  return config.security;
};

// Feature flag component wrapper
export const withEnterpriseFeature = <P extends object>(
  Component: React.ComponentType<P>,
  feature: keyof EnterpriseConfig['features'],
  fallback?: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    if (isFeatureEnabled(feature)) {
      return React.createElement(Component, props);
    }
    
    if (fallback) {
      return React.createElement(fallback, props);
    }
    
    return null;
  };
  
  WrappedComponent.displayName = `withEnterpriseFeature(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for enterprise configuration
export const useEnterpriseConfig = () => {
  return {
    config: getEnterpriseConfig(),
    isFeatureEnabled,
    getFeatureLimit,
    getSyncConfig,
    getSecurityConfig,
  };
};
