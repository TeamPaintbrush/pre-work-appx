// Integration Ecosystem Components Export
// Centralized exports for all integration components

export { IntegrationAnalyticsDashboard } from './IntegrationAnalyticsDashboard';
export { WorkflowAutomation } from './WorkflowAutomation';
export { default as RealTimeSync } from './RealTimeSync';

// Re-export related types for convenience
export type {
  IntegrationAnalytics,
  AnalyticsMetric,
  AnalyticsChart,
  AnalyticsInsight
} from '../../types/integrations';

// Re-export service for convenience
export { integrationEcosystemService } from '../../services/integrations/IntegrationEcosystemService';
