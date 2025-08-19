// Automation & Workflows Types
// Advanced workflow automation, triggers, conditions, actions, integrations

export interface AutomationRule {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  priority: number; // 1-10, higher executes first
  category: AutomationCategory;
  triggers: AutomationTrigger[];
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  schedule?: AutomationSchedule;
  execution: AutomationExecution;
  metadata: AutomationMetadata;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AutomationCategory = 
  | 'task_management' 
  | 'notifications' 
  | 'status_updates' 
  | 'assignments' 
  | 'reporting' 
  | 'integrations' 
  | 'data_sync' 
  | 'custom';

export interface AutomationTrigger {
  id: string;
  type: TriggerType;
  event: string;
  source: TriggerSource;
  conditions: TriggerCondition[];
  parameters: Record<string, any>;
  debounce?: number; // milliseconds to wait before triggering
}

export type TriggerType = 
  | 'event' 
  | 'schedule' 
  | 'webhook' 
  | 'status_change' 
  | 'field_update' 
  | 'time_based' 
  | 'user_action' 
  | 'api_call';

export type TriggerSource = 
  | 'task' 
  | 'project' 
  | 'user' 
  | 'system' 
  | 'external' 
  | 'webhook' 
  | 'integration';

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
}

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'greater_equal' 
  | 'less_equal' 
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with' 
  | 'in' 
  | 'not_in' 
  | 'exists' 
  | 'not_exists' 
  | 'regex' 
  | 'between';

export interface AutomationCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  logicalOperator?: 'AND' | 'OR';
  group?: string; // For grouping conditions
  isNegated: boolean;
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  category: ActionCategory;
  target: ActionTarget;
  parameters: ActionParameters;
  delay?: number; // milliseconds to wait before executing
  retries: ActionRetryConfig;
  onSuccess?: AutomationAction[];
  onFailure?: AutomationAction[];
}

export type ActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'assign' 
  | 'notify' 
  | 'email' 
  | 'webhook' 
  | 'integration' 
  | 'calculation' 
  | 'conditional' 
  | 'loop' 
  | 'api_call';

export type ActionCategory = 
  | 'task_operations' 
  | 'user_operations' 
  | 'notifications' 
  | 'integrations' 
  | 'data_operations' 
  | 'system_operations';

export interface ActionTarget {
  type: 'task' | 'project' | 'user' | 'system' | 'external' | 'webhook';
  id?: string;
  selector?: string; // For dynamic targeting
  multiple?: boolean; // Whether action applies to multiple targets
}

export interface ActionParameters {
  [key: string]: any;
  template?: string; // For templated content
  variables?: Record<string, any>; // Dynamic variables
  mapping?: Record<string, string>; // Field mappings
}

export interface ActionRetryConfig {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

export interface AutomationSchedule {
  type: 'once' | 'recurring' | 'cron';
  startDate?: Date;
  endDate?: Date;
  cronExpression?: string;
  timezone: string;
  isActive: boolean;
}

export interface AutomationExecution {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastRun?: AutomationRun;
  averageExecutionTime: number; // milliseconds
  status: 'active' | 'paused' | 'error' | 'disabled';
}

export interface AutomationRun {
  id: string;
  automationId: string;
  triggeredAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: RunStatus;
  triggerData: Record<string, any>;
  steps: AutomationStep[];
  result: AutomationResult;
  errors: AutomationError[];
  duration: number; // milliseconds
  metadata: RunMetadata;
}

export type RunStatus = 
  | 'queued' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'timeout';

export interface AutomationStep {
  id: string;
  actionId: string;
  stepNumber: number;
  name: string;
  status: StepStatus;
  startedAt?: Date;
  completedAt?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: AutomationError;
  duration: number; // milliseconds
}

export type StepStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'skipped' 
  | 'retrying';

export interface AutomationResult {
  success: boolean;
  affectedEntities: AffectedEntity[];
  outputData: Record<string, any>;
  summary: string;
  metrics: ExecutionMetrics;
}

export interface AffectedEntity {
  type: string;
  id: string;
  action: string;
  changes?: Record<string, any>;
}

export interface ExecutionMetrics {
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalDuration: number;
  averageStepDuration: number;
}

export interface AutomationError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  retryAttempt?: number;
}

export interface RunMetadata {
  source: 'trigger' | 'manual' | 'schedule' | 'api';
  userId?: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  correlationId?: string;
}

export interface AutomationMetadata {
  tags: string[];
  version: string;
  lastModifiedBy: string;
  changeLog: AutomationChange[];
  usage: AutomationUsage;
  performance: AutomationPerformance;
}

export interface AutomationChange {
  id: string;
  timestamp: Date;
  userId: string;
  type: 'created' | 'updated' | 'enabled' | 'disabled' | 'deleted';
  description: string;
  changes: Record<string, any>;
}

export interface AutomationUsage {
  totalExecutions: number;
  monthlyExecutions: number;
  averageExecutionsPerDay: number;
  lastExecuted?: Date;
  popularTriggers: string[];
  popularActions: string[];
}

export interface AutomationPerformance {
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  performanceTrend: 'improving' | 'stable' | 'degrading';
  bottlenecks: string[];
}

// Form Automation
export interface FormAutomation {
  id: string;
  formId: string;
  workspaceId: string;
  name: string;
  triggers: FormTrigger[];
  validations: FormValidation[];
  transformations: FormTransformation[];
  actions: FormAction[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormTrigger {
  type: 'submission' | 'field_change' | 'validation' | 'save_draft';
  conditions: TriggerCondition[];
}

export interface FormValidation {
  id: string;
  field: string;
  rules: ValidationRule[];
  errorMessage: string;
  isRequired: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'regex' | 'min_length' | 'max_length' | 'custom';
  value?: any;
  message: string;
}

export interface FormTransformation {
  id: string;
  sourceField: string;
  targetField: string;
  transformation: TransformationType;
  parameters: Record<string, any>;
}

export type TransformationType = 
  | 'uppercase' 
  | 'lowercase' 
  | 'capitalize' 
  | 'trim' 
  | 'format_date' 
  | 'format_number' 
  | 'calculate' 
  | 'lookup' 
  | 'custom';

export interface FormAction {
  type: 'create_task' | 'send_email' | 'update_status' | 'webhook' | 'integration';
  parameters: Record<string, any>;
  conditions?: AutomationCondition[];
}

// Integration Automation
export interface IntegrationAutomation {
  id: string;
  workspaceId: string;
  name: string;
  sourceSystem: IntegrationSystem;
  targetSystem: IntegrationSystem;
  syncType: SyncType;
  syncDirection: SyncDirection;
  mapping: FieldMapping[];
  schedule: SyncSchedule;
  filters: SyncFilter[];
  transformations: DataTransformation[];
  status: IntegrationStatus;
  lastSync?: SyncExecution;
  metrics: IntegrationMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationSystem {
  type: SystemType;
  name: string;
  endpoint?: string;
  authentication: AuthenticationConfig;
  capabilities: SystemCapability[];
  rateLimit?: RateLimit;
}

export type SystemType = 
  | 'database' 
  | 'api' 
  | 'file' 
  | 'email' 
  | 'crm' 
  | 'project_management' 
  | 'accounting' 
  | 'analytics' 
  | 'custom';

export interface AuthenticationConfig {
  type: 'none' | 'api_key' | 'oauth' | 'basic' | 'jwt' | 'custom';
  credentials: Record<string, string>;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface SystemCapability {
  operation: 'read' | 'write' | 'update' | 'delete';
  entities: string[];
  rateLimit?: number;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export type SyncType = 'real_time' | 'batch' | 'incremental' | 'full';
export type SyncDirection = 'unidirectional' | 'bidirectional';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: TransformationType;
  defaultValue?: any;
  isRequired: boolean;
}

export interface SyncSchedule {
  type: 'manual' | 'interval' | 'cron' | 'trigger_based';
  interval?: number; // minutes
  cronExpression?: string;
  timezone: string;
}

export interface SyncFilter {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface DataTransformation {
  id: string;
  name: string;
  type: TransformationType;
  sourceFields: string[];
  targetField: string;
  parameters: Record<string, any>;
}

export type IntegrationStatus = 
  | 'active' 
  | 'paused' 
  | 'error' 
  | 'configuring' 
  | 'testing' 
  | 'disabled';

export interface SyncExecution {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: SyncError[];
  duration: number; // milliseconds
}

export interface SyncError {
  recordId?: string;
  field?: string;
  message: string;
  code: string;
  severity: 'warning' | 'error' | 'critical';
}

export interface IntegrationMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  totalRecordsProcessed: number;
  dataQualityScore: number; // 0-100
  uptimePercentage: number; // 0-100
  lastSuccessfulSync?: Date;
}

// Workflow Templates
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  industry?: string[];
  useCase: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
  template: AutomationRule[];
  requirements: TemplateRequirement[];
  estimatedSetupTime: number; // minutes
  benefits: string[];
  screenshots?: string[];
  documentation: string;
  rating: number;
  usageCount: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowCategory = 
  | 'task_automation' 
  | 'project_management' 
  | 'team_collaboration' 
  | 'reporting' 
  | 'integrations' 
  | 'notifications' 
  | 'data_processing';

export interface TemplateRequirement {
  type: 'integration' | 'permission' | 'plan' | 'configuration';
  name: string;
  description: string;
  isRequired: boolean;
}

// Smart Suggestions
export interface AutomationSuggestion {
  id: string;
  workspaceId: string;
  type: SuggestionType;
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: SuggestionImpact;
  effort: SuggestionEffort;
  category: string;
  automationRule?: Partial<AutomationRule>;
  templateId?: string;
  metrics: SuggestionMetrics;
  status: SuggestionStatus;
  createdAt: Date;
  dismissedAt?: Date;
  implementedAt?: Date;
}

export type SuggestionType = 
  | 'optimization' 
  | 'new_automation' 
  | 'template_suggestion' 
  | 'integration_opportunity' 
  | 'process_improvement';

export type SuggestionImpact = 'low' | 'medium' | 'high' | 'very_high';
export type SuggestionEffort = 'low' | 'medium' | 'high' | 'very_high';

export interface SuggestionMetrics {
  potentialTimeSaved: number; // hours per week
  potentialErrorReduction: number; // percentage
  affectedTasks: number;
  usersImpacted: number;
}

export type SuggestionStatus = 
  | 'pending' 
  | 'viewed' 
  | 'dismissed' 
  | 'implemented' 
  | 'in_progress';
