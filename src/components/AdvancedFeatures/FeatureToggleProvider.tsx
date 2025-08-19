// Feature Toggle Provider - Controls which advanced features are visible
// Maintains backward compatibility while enabling progressive enhancement

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FeatureFlags {
  // Collaboration Features
  enableComments: boolean;
  enableFileSharing: boolean;
  enableMentions: boolean;
  enableActivityFeed: boolean;
  enableRealTimeCollab: boolean;
  
  // Project Management Features
  enableGoals: boolean;
  enableTimeTracking: boolean;
  enableResourceManagement: boolean;
  enableProjectTemplates: boolean;
  enableMilestones: boolean;
  
  // Automation Features
  enableAutomation: boolean;
  enableWorkflows: boolean;
  enableIntegrations: boolean;
  enableSmartSuggestions: boolean;
  
  // Integration Features
  integrationAnalytics: boolean;
  workflowAutomation: boolean;
  realTimeSync: boolean;
  
  // AI Features
  aiDashboard: boolean;
  aiTaskPrioritization: boolean;
  aiProgressPrediction: boolean;
  aiInsightGeneration: boolean;
  aiTaskSuggestions: boolean;
  aiSmartScheduling: boolean;
  aiTemplateGeneration: boolean;
  
  // Communication Features
  enableMessaging: boolean;
  enableVideoCalls: boolean;
  enableWhiteboards: boolean;
  enableKnowledgeBase: boolean;
  enableAdvancedSearch: boolean;
  
  // UI Enhancement Features
  enableAdvancedAnalytics: boolean;
  enableBulkOperations: boolean;
  enableKeyboardShortcuts: boolean;
  enableAdvancedFilters: boolean;
  enableCustomFields: boolean;
}

interface FeatureToggleContextType {
  features: FeatureFlags;
  updateFeature: (feature: keyof FeatureFlags, enabled: boolean) => void;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  enabledFeaturesCount: number;
  toggleAdvancedMode: () => void;
  isAdvancedMode: boolean;
  isLoaded: boolean;
}

const defaultFeatures: FeatureFlags = {
  // All features disabled by default for hydration safety
  enableComments: false,
  enableFileSharing: false,
  enableMentions: false,
  enableActivityFeed: false,
  enableRealTimeCollab: false,
  enableGoals: false,
  enableTimeTracking: false,
  enableResourceManagement: false,
  enableProjectTemplates: false,
  enableMilestones: false,
  enableAutomation: false,
  enableWorkflows: false,
  enableIntegrations: false,
  enableSmartSuggestions: false,
  
  // Integration Features - Enabled by default for the integration ecosystem
  integrationAnalytics: true,
  workflowAutomation: true,
  realTimeSync: true,
  
  // AI Features - Enabled by default for the enhanced experience
  aiDashboard: true,
  aiTaskPrioritization: true,
  aiProgressPrediction: true,
  aiInsightGeneration: true,
  aiTaskSuggestions: true,
  aiSmartScheduling: true,
  aiTemplateGeneration: true,
  
  enableMessaging: false,
  enableVideoCalls: false,
  enableWhiteboards: false,
  enableKnowledgeBase: false,
  enableAdvancedSearch: false,
  enableAdvancedAnalytics: false,
  enableBulkOperations: false,
  enableKeyboardShortcuts: false,
  enableAdvancedFilters: false,
  enableCustomFields: false,
};

const FeatureToggleContext = createContext<FeatureToggleContextType | undefined>(undefined);

interface FeatureToggleProviderProps {
  children: ReactNode;
}

export function FeatureToggleProvider({ children }: FeatureToggleProviderProps) {
  const [features, setFeatures] = useState<FeatureFlags>(defaultFeatures);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load feature preferences from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFeatures = localStorage.getItem('prework-feature-flags');
        const savedAdvancedMode = localStorage.getItem('prework-advanced-mode');
        
        if (savedFeatures) {
          const parsed = JSON.parse(savedFeatures);
          setFeatures({ ...defaultFeatures, ...parsed });
        }
        
        if (savedAdvancedMode) {
          setIsAdvancedMode(JSON.parse(savedAdvancedMode));
        }
      } catch (error) {
        console.warn('Failed to load feature preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save feature preferences to localStorage (client-side only)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('prework-feature-flags', JSON.stringify(features));
        localStorage.setItem('prework-advanced-mode', JSON.stringify(isAdvancedMode));
      } catch (error) {
        console.warn('Failed to save feature preferences:', error);
      }
    }
  }, [features, isAdvancedMode, isLoaded]);

  const enabledFeaturesCount = Object.values(features).filter(Boolean).length;

  const updateFeature = (feature: keyof FeatureFlags, enabled: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: enabled
    }));
  };

  const isFeatureEnabled = (feature: keyof FeatureFlags) => {
    return isLoaded && features[feature];
  };

  const toggleAdvancedMode = () => {
    setIsAdvancedMode(prev => {
      const newMode = !prev;
      
      if (newMode) {
        // Enable some default features when entering advanced mode
        setFeatures(prev => ({
          ...prev,
          enableComments: true,
          enableTimeTracking: true,
          enableProjectTemplates: true,
          enableAdvancedAnalytics: true,
        }));
      }
      
      return newMode;
    });
  };

  const contextValue: FeatureToggleContextType = {
    features,
    updateFeature,
    isFeatureEnabled,
    enabledFeaturesCount,
    toggleAdvancedMode,
    isAdvancedMode,
    isLoaded,
  };

  return (
    <FeatureToggleContext.Provider value={contextValue}>
      {children}
    </FeatureToggleContext.Provider>
  );
}

export function useFeatureToggle() {
  const context = useContext(FeatureToggleContext);
  if (context === undefined) {
    throw new Error('useFeatureToggle must be used within a FeatureToggleProvider');
  }
  return context;
}

// Utility hook for checking specific features
export function useFeature(feature: keyof FeatureFlags): boolean {
  const { isFeatureEnabled } = useFeatureToggle();
  return isFeatureEnabled(feature);
}

// Utility component for conditional rendering - hydration safe
interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { isFeatureEnabled, isLoaded } = useFeatureToggle();
  
  // Don't render anything until client-side hydration is complete
  if (!isLoaded) {
    return <>{fallback}</>;
  }
  
  return isFeatureEnabled(feature) ? <>{children}</> : <>{fallback}</>;
}

// Higher-order component for feature-gated components
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  feature: keyof FeatureFlags,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureGatedComponent(props: P) {
    const { isFeatureEnabled, isLoaded } = useFeatureToggle();
    
    if (!isLoaded) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }
    
    if (isFeatureEnabled(feature)) {
      return <Component {...props} />;
    }
    
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
}
