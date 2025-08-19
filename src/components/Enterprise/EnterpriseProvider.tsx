// Enterprise Context Provider - Wraps existing components with enterprise features
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useEnterpriseFeatures } from '../../hooks/useEnterprise';
import { useEnterpriseConfig } from '../../utils/enterpriseConfig';

interface EnterpriseContextType {
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
  workspace: any;
  customFields: any[];
  currentView: string;
  isFeatureEnabled: (feature: string) => boolean;
  enterpriseConfig: any;
}

const EnterpriseContext = createContext<EnterpriseContextType | null>(null);

interface EnterpriseProviderProps {
  children: ReactNode;
  userId?: string;
  defaultWorkspaceId?: string;
}

export function EnterpriseProvider({ children, userId = 'default-user', defaultWorkspaceId }: EnterpriseProviderProps) {
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(defaultWorkspaceId || null);
  const { config, isFeatureEnabled } = useEnterpriseConfig();
  const enterpriseFeatures = useEnterpriseFeatures(workspaceId);

  // If enterprise is disabled, just pass through without enterprise features
  if (!config.enabled) {
    return <>{children}</>;
  }

  return (
    <EnterpriseContext.Provider value={{
      workspaceId,
      setWorkspaceId,
      workspace: enterpriseFeatures.workspace,
      customFields: enterpriseFeatures.customFields,
      currentView: enterpriseFeatures.currentView,
      isFeatureEnabled: enterpriseFeatures.isFeatureEnabled,
      enterpriseConfig: config,
    }}>
      {children}
    </EnterpriseContext.Provider>
  );
}

export function useEnterpriseContext() {
  return useContext(EnterpriseContext);
}

// HOC to wrap existing components with enterprise features
export function withEnterprise<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  enterpriseProps?: Record<string, any>
) {
  return function EnterpriseWrappedComponent(props: P) {
    const enterpriseContext = useEnterpriseContext();
    
    // If no enterprise context, render component normally
    if (!enterpriseContext) {
      return <WrappedComponent {...props} />;
    }

    // Add enterprise props to component without changing its interface
    const enhancedProps = {
      ...props,
      // These are available but won't break existing prop interfaces
      ...(enterpriseProps || {}),
    };

    return <WrappedComponent {...enhancedProps} />;
  };
}
