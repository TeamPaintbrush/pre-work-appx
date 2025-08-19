// Enterprise Project Management Types
// Extends existing checklist system for enterprise functionality

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  settings: WorkspaceSettings;
  customFields: CustomField[];
  workflows: Workflow[];
  boardConfigurations: BoardConfiguration[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface WorkspaceSettings {
  defaultView: ViewType;
  allowedViews: ViewType[];
  timeTracking: boolean;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  security: SecuritySettings;
}

export interface CustomField {
  id: string;
  workspaceId: string;
  name: string;
  type: CustomFieldType;
  description?: string;
  options?: CustomFieldOption[];
  defaultValue?: any;
  isRequired: boolean;
  isVisible: boolean;
  order: number;
  applicableToTypes: EntityType[];
  validation?: FieldValidation;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomFieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'dropdown' 
  | 'multiselect' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'currency' 
  | 'percentage' 
  | 'user' 
  | 'file';

export interface CustomFieldOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  order: number;
  isActive: boolean;
}

export type EntityType = 'project' | 'task' | 'checklist' | 'template' | 'user';

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  entityType: EntityType;
  statusStages: StatusStage[];
  rules: WorkflowRule[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isInitial: boolean;
  isFinal: boolean;
  allowedTransitions: string[]; // IDs of stages this can transition to
  permissions: StagePermissions;
}

export interface StagePermissions {
  canEdit: string[]; // Role IDs that can edit in this stage
  canDelete: string[]; // Role IDs that can delete in this stage
  canTransition: string[]; // Role IDs that can transition from this stage
}

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
}

export interface RuleTrigger {
  type: 'status_change' | 'field_update' | 'time_based' | 'user_action';
  parameters: Record<string, any>;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface RuleAction {
  type: 'update_field' | 'send_notification' | 'assign_user' | 'create_task' | 'move_status';
  parameters: Record<string, any>;
}

export interface BoardConfiguration {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  viewType: ViewType;
  settings: BoardSettings;
  layout: BoardLayout;
  filters: BoardFilter[];
  sorting: BoardSorting[];
  grouping?: BoardGrouping;
  isDefault: boolean;
  isPublic: boolean;
  sharedWith: string[]; // User IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ViewType = 'list' | 'kanban' | 'calendar' | 'timeline' | 'table' | 'dashboard';

export interface BoardSettings {
  showCompleted: boolean;
  showArchived: boolean;
  defaultAssignee?: string;
  autoAssign: boolean;
  enableTimeTracking: boolean;
  enableComments: boolean;
  enableAttachments: boolean;
  colorScheme: string;
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface BoardLayout {
  columns: BoardColumn[];
  swimlanes?: BoardSwimlane[];
  customization: LayoutCustomization;
}

export interface BoardColumn {
  id: string;
  name: string;
  width?: number;
  isVisible: boolean;
  order: number;
  type: 'field' | 'custom_field' | 'system';
  fieldId?: string;
}

export interface BoardSwimlane {
  id: string;
  name: string;
  groupBy: string;
  isVisible: boolean;
  order: number;
}

export interface LayoutCustomization {
  cardFields: string[]; // Field IDs to show on cards
  cardSize: 'small' | 'medium' | 'large';
  showAvatars: boolean;
  showDueDates: boolean;
  showPriority: boolean;
  showProgress: boolean;
}

export interface BoardFilter {
  id: string;
  name: string;
  field: string;
  operator: string;
  value: any;
  isActive: boolean;
}

export interface BoardSorting {
  field: string;
  direction: 'asc' | 'desc';
  order: number;
}

export interface BoardGrouping {
  field: string;
  direction: 'asc' | 'desc';
  showEmpty: boolean;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  desktop: boolean;
  mobile: boolean;
  digest: 'none' | 'daily' | 'weekly';
  types: NotificationType[];
}

export type NotificationType = 
  | 'task_assigned' 
  | 'task_completed' 
  | 'due_date_approaching' 
  | 'status_changed' 
  | 'comment_added' 
  | 'mention' 
  | 'project_updated';

export interface IntegrationSettings {
  calendar: CalendarIntegration;
  timeTracking: TimeTrackingIntegration;
  communication: CommunicationIntegration;
  storage: StorageIntegration;
}

export interface CalendarIntegration {
  enabled: boolean;
  provider: 'google' | 'outlook' | 'apple' | 'custom';
  syncDirection: 'import' | 'export' | 'bidirectional';
  calendarIds: string[];
}

export interface TimeTrackingIntegration {
  enabled: boolean;
  provider: 'built-in' | 'toggl' | 'harvest' | 'clockify';
  autoStart: boolean;
  roundingRules: string;
}

export interface CommunicationIntegration {
  slack: SlackIntegration;
  teams: TeamsIntegration;
  email: EmailIntegration;
}

export interface SlackIntegration {
  enabled: boolean;
  webhookUrl?: string;
  channels: string[];
  notifications: string[];
}

export interface TeamsIntegration {
  enabled: boolean;
  webhookUrl?: string;
  channels: string[];
  notifications: string[];
}

export interface EmailIntegration {
  enabled: boolean;
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  settings: Record<string, any>;
}

export interface StorageIntegration {
  provider: 'aws_s3' | 'google_drive' | 'dropbox' | 'onedrive';
  settings: Record<string, any>;
  autoSync: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  dataRetention: number; // days
  auditLog: boolean;
  encryption: EncryptionSettings;
}

export interface EncryptionSettings {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyRotation: number; // days
}

// Enhanced Project and Task types with enterprise features
export interface EnterpriseProject extends BaseProject {
  workspaceId: string;
  customFieldValues: CustomFieldValue[];
  workflowId: string;
  currentStatus: string;
  boardConfigurationId?: string;
  budget?: ProjectBudget;
  resources: ProjectResource[];
  milestones: ProjectMilestone[];
  dependencies: ProjectDependency[];
  riskAssessment?: RiskAssessment;
}

export interface BaseProject {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  teamMembers: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CustomFieldValue {
  fieldId: string;
  value: any;
  updatedAt: Date;
  updatedBy: string;
}

export interface ProjectBudget {
  total: number;
  currency: string;
  spent: number;
  allocations: BudgetAllocation[];
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  spent: number;
}

export interface ProjectResource {
  id: string;
  type: 'human' | 'equipment' | 'material' | 'budget';
  name: string;
  allocation: number; // percentage or hours
  cost?: number;
  availability: ResourceAvailability[];
}

export interface ResourceAvailability {
  startDate: Date;
  endDate: Date;
  capacity: number; // percentage
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[]; // Milestone IDs
  deliverables: string[];
}

export interface ProjectDependency {
  id: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  predecessorId: string;
  successorId: string;
  lag: number; // days
}

export interface RiskAssessment {
  risks: ProjectRisk[];
  overallScore: number;
  lastAssessed: Date;
  assessedBy: string;
}

export interface ProjectRisk {
  id: string;
  description: string;
  category: string;
  probability: number; // 1-5
  impact: number; // 1-5
  severity: number; // calculated
  mitigation: string;
  owner: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'closed';
}

export interface ProjectMember {
  userId: string;
  role: string;
  joinedAt: Date;
  permissions: string[];
  allocation: number; // percentage
}

// Enhanced Task types
export interface EnterpriseTask extends BaseTask {
  projectId?: string;
  workspaceId: string;
  customFieldValues: CustomFieldValue[];
  workflowId: string;
  currentStatus: string;
  timeTracking: TimeTrackingData;
  dependencies: TaskDependency[];
  subtasks: string[]; // Task IDs
  parentTaskId?: string;
  effort: TaskEffort;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  history: TaskHistory[];
}

export interface BaseTask {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  isActive: boolean;
}

export interface TimeTrackingData {
  estimated: number; // hours
  logged: number; // hours
  remaining: number; // hours
  sessions: TimeSession[];
  billable: boolean;
  billableRate?: number;
}

export interface TimeSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  description?: string;
  isManual: boolean;
}

export interface TaskDependency {
  id: string;
  type: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates';
  relatedTaskId: string;
  description?: string;
}

export interface TaskEffort {
  storyPoints?: number;
  complexity: 'low' | 'medium' | 'high';
  businessValue: number; // 1-10
  technicalRisk: number; // 1-10
}

export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  mentions: string[]; // User IDs
  attachments: string[]; // File IDs
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  uploadedBy: string;
  uploadedAt: Date;
  isImage: boolean;
  thumbnailKey?: string;
}

export interface TaskHistory {
  id: string;
  userId: string;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  description: string;
}

// Dashboard and Analytics types
export interface Dashboard {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  isDefault: boolean;
  isPublic: boolean;
  sharedWith: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  responsive: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: WidgetDataSource;
  refreshInterval?: number; // seconds
}

export type WidgetType = 
  | 'chart' 
  | 'kpi' 
  | 'table' 
  | 'list' 
  | 'calendar' 
  | 'progress' 
  | 'activity_feed' 
  | 'custom';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
  timeframe?: string;
  groupBy?: string;
  limit?: number;
}

export interface WidgetDataSource {
  entity: EntityType;
  fields: string[];
  filters: Record<string, any>;
  sorting?: Record<string, 'asc' | 'desc'>;
}

export interface DashboardFilter {
  id: string;
  name: string;
  field: string;
  type: 'dropdown' | 'date_range' | 'checkbox' | 'search';
  options?: FilterOption[];
  defaultValue?: any;
}

export interface FilterOption {
  label: string;
  value: any;
}

// Sync and Real-time types
export interface SyncConfiguration {
  workspaceId: string;
  realTimeEnabled: boolean;
  conflictResolution: 'last_write_wins' | 'manual' | 'merge';
  syncInterval: number; // seconds for offline sync
  deltaSync: boolean;
  compressionEnabled: boolean;
}

export interface SyncOperation {
  id: string;
  workspaceId: string;
  userId: string;
  entityType: EntityType;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  status: 'pending' | 'synced' | 'failed' | 'conflict';
  retryCount: number;
  errorMessage?: string;
}

export interface ConflictResolution {
  id: string;
  syncOperationId: string;
  conflictType: 'concurrent_edit' | 'delete_modified' | 'schema_mismatch';
  localData: any;
  remoteData: any;
  resolution: 'local' | 'remote' | 'merged' | 'manual';
  resolvedData?: any;
  resolvedBy?: string;
  resolvedAt?: Date;
}
