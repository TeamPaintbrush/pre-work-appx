// Integration Ecosystem Type Definitions
// Maintains enterprise structure with AWS integration

export interface IntegrationConnection {
  id: string;
  workspaceId: string;
  userId: string;
  providerId: string;
  providerName: string;
  providerType: 'email' | 'productivity' | 'communication' | 'storage' | 'calendar' | 'project_management';
  connectionType: 'oauth2' | 'api_key' | 'webhook' | 'direct';
  status: 'connected' | 'disconnected' | 'error' | 'pending' | 'expired';
  credentials: EncryptedCredentials;
  scopes: string[];
  metadata: Record<string, any>;
  lastSync: Date;
  lastError?: string;
  autoSync: boolean;
  syncFrequency: 'realtime' | 'every_5min' | 'hourly' | 'daily';
  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptedCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  secretKey?: string;
  expiresAt?: Date;
  tokenType: string;
  encrypted: boolean;
}

// Workflow Automation Types
export interface WorkflowAutomation {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  frequency: WorkflowFrequency;
  analytics: WorkflowAnalytics;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'email_received' | 'task_completed' | 'checklist_created' | 'progress_milestone' | 'integration_event';
  config: TriggerConfig;
  metadata: Record<string, any>;
}

export interface TriggerConfig {
  // For webhook triggers
  webhookUrl?: string;
  secret?: string;
  
  // For schedule triggers
  cronExpression?: string;
  timezone?: string;
  
  // For email triggers
  emailFilters?: EmailFilter[];
  
  // For task/checklist triggers
  checklistIds?: string[];
  taskFilters?: TaskFilter[];
  
  // For integration triggers
  integrationId?: string;
  eventTypes?: string[];
}

export interface EmailFilter {
  field: 'from' | 'to' | 'subject' | 'body' | 'attachment' | 'domain';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  caseSensitive: boolean;
}

export interface TaskFilter {
  field: 'title' | 'description' | 'priority' | 'assignee' | 'dueDate' | 'category';
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logicOperator: 'and' | 'or';
}

export interface WorkflowAction {
  type: 'send_email' | 'create_task' | 'update_task' | 'create_checklist' | 'send_notification' | 'webhook_call' | 'integration_sync' | 'ai_analysis';
  config: ActionConfig;
  retryPolicy: RetryPolicy;
  order: number;
}

export interface ActionConfig {
  // For email actions
  emailTemplate?: string;
  recipients?: string[];
  subject?: string;
  body?: string;
  
  // For task actions
  taskTitle?: string;
  taskDescription?: string;
  assignee?: string;
  dueDate?: string;
  priority?: string;
  
  // For webhook actions
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  
  // For integration actions
  integrationId?: string;
  syncType?: 'full' | 'incremental';
  
  // Dynamic variables
  variables?: Record<string, string>;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  delaySeconds: number;
  maxDelaySeconds: number;
}

export interface WorkflowFrequency {
  type: 'once' | 'recurring';
  interval?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  intervalValue?: number;
  maxExecutions?: number;
}

export interface WorkflowAnalytics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // milliseconds
  lastExecutionStatus: 'success' | 'failed' | 'running';
  lastExecutionTime?: Date;
  errorRate: number; // percentage
}

// Real-time Sync Types
export interface RealTimeSync {
  id: string;
  workspaceId: string;
  connectionId: string;
  syncType: 'full' | 'incremental' | 'delta' | 'realtime';
  direction: 'import' | 'export' | 'bidirectional';
  status: 'active' | 'paused' | 'error' | 'syncing' | 'idle';
  configuration: SyncConfiguration;
  metrics: SyncMetrics;
  lastSync: Date;
  nextSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncConfiguration {
  batchSize: number;
  syncInterval: number; // seconds
  conflictResolution: 'source_wins' | 'destination_wins' | 'merge' | 'manual';
  fieldMappings: FieldMapping[];
  filters: SyncFilter[];
  transformations: DataTransformation[];
  webhookEndpoint?: string;
  enableRealtime: boolean;
}

export interface FieldMapping {
  sourceField: string;
  destinationField: string;
  transformation?: string;
  required: boolean;
  defaultValue?: any;
}

export interface SyncFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface DataTransformation {
  type: 'format_date' | 'format_text' | 'calculate' | 'lookup' | 'conditional';
  field: string;
  config: Record<string, any>;
}

export interface SyncMetrics {
  totalRecords: number;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  recordsSkipped: number;
  bytesTransferred: number;
  syncDuration: number; // milliseconds
  throughput: number; // records per second
  errorDetails: SyncError[];
}

export interface SyncError {
  id: string;
  recordId?: string;
  errorType: 'validation' | 'network' | 'authentication' | 'transformation' | 'conflict';
  errorMessage: string;
  errorDetails: Record<string, any>;
  timestamp: Date;
  retryCount: number;
  resolved: boolean;
}

// Analytics Dashboard Types
export interface IntegrationAnalytics {
  workspaceId: string;
  period: AnalyticsPeriod;
  metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
  insights: AnalyticsInsight[];
  generatedAt: Date;
}

export interface AnalyticsPeriod {
  type: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change from previous period
  target?: number;
  status: 'good' | 'warning' | 'critical';
  category: 'performance' | 'reliability' | 'usage' | 'efficiency';
}

export interface AnalyticsChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'gauge';
  title: string;
  description: string;
  data: ChartDataPoint[];
  config: ChartConfig;
}

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  aggregation: 'sum' | 'average' | 'count' | 'max' | 'min';
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number; // 0-100
  actionable: boolean;
  suggestedActions: string[];
  relatedMetrics: string[];
  generatedAt: Date;
}

// Integration Event Types
export interface IntegrationEvent {
  id: string;
  workspaceId: string;
  connectionId: string;
  eventType: string;
  source: 'webhook' | 'polling' | 'manual' | 'system';
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processedAt?: Date;
  processingTime?: number;
  errorMessage?: string;
  triggeredWorkflows: string[];
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  headers: Record<string, string>;
  body: any;
  signature?: string;
  verified: boolean;
  processed: boolean;
  retryCount: number;
  createdAt: Date;
}

// Integration Health Types
export interface IntegrationHealth {
  connectionId: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  lastCheck: Date;
  uptime: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  healthChecks: HealthCheck[];
}

export interface HealthCheck {
  type: 'connectivity' | 'authentication' | 'rate_limit' | 'functionality';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  timestamp: Date;
  responseTime?: number;
}

// Integration Template Types
export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  workflowTemplate: Partial<WorkflowAutomation>;
  syncTemplate: Partial<RealTimeSync>;
  configurationSteps: ConfigurationStep[];
  popularity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // minutes
}

export interface ConfigurationStep {
  step: number;
  title: string;
  description: string;
  type: 'auth' | 'config' | 'mapping' | 'test';
  required: boolean;
  helpText?: string;
  fields: ConfigurationField[];
}

export interface ConfigurationField {
  name: string;
  type: 'text' | 'password' | 'select' | 'checkbox' | 'url' | 'email';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  validation?: string; // regex pattern
  helpText?: string;
}

// Rate Limiting Types
export interface RateLimit {
  connectionId: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  currentUsage: RateLimitUsage;
  resetTimes: RateLimitReset;
}

export interface RateLimitUsage {
  minuteCount: number;
  hourCount: number;
  dayCount: number;
  lastRequest: Date;
}

export interface RateLimitReset {
  minuteReset: Date;
  hourReset: Date;
  dayReset: Date;
}

// Audit and Compliance Types
export interface IntegrationAuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  resourceType: 'connection' | 'workflow' | 'sync' | 'webhook';
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface ComplianceReport {
  workspaceId: string;
  reportType: 'gdpr' | 'hipaa' | 'sox' | 'custom';
  period: AnalyticsPeriod;
  dataTransfers: DataTransferRecord[];
  accessLogs: AccessLogRecord[];
  retentionStatus: RetentionStatusRecord[];
  violations: ComplianceViolation[];
  generatedAt: Date;
}

export interface DataTransferRecord {
  transferId: string;
  sourceSystem: string;
  destinationSystem: string;
  dataType: string;
  recordCount: number;
  sensitiveData: boolean;
  encryptionUsed: boolean;
  timestamp: Date;
}

export interface AccessLogRecord {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  authorized: boolean;
  ipAddress: string;
}

export interface RetentionStatusRecord {
  dataType: string;
  retentionPeriod: number; // days
  oldestRecord: Date;
  recordsToDelete: number;
  lastCleanup: Date;
}

export interface ComplianceViolation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRecords: number;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}
