// Advanced Project Management Types
// Goals, milestones, time tracking, resource management, project templates

export interface ProjectGoal {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description?: string;
  type: GoalType;
  category: GoalCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: GoalStatus;
  progress: number; // 0-100 percentage
  targetValue?: number;
  currentValue?: number;
  unit?: string; // e.g., 'hours', 'tasks', 'revenue', 'users'
  targetDate: Date;
  startDate?: Date;
  completedDate?: Date;
  assignedTo: string[];
  dependencies: GoalDependency[];
  milestones: PMProjectMilestone[];
  kpis: GoalKPI[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: GoalMetadata;
}

export type GoalType = 
  | 'outcome' 
  | 'output' 
  | 'process' 
  | 'financial' 
  | 'quality' 
  | 'timeline' 
  | 'custom';

export type GoalCategory = 
  | 'business' 
  | 'technical' 
  | 'quality' 
  | 'performance' 
  | 'user_experience' 
  | 'compliance' 
  | 'security';

export type GoalStatus = 
  | 'draft' 
  | 'planned' 
  | 'in_progress' 
  | 'on_track' 
  | 'at_risk' 
  | 'blocked' 
  | 'completed' 
  | 'cancelled' 
  | 'deferred';

export interface GoalDependency {
  id: string;
  type: 'blocks' | 'enables' | 'influences';
  dependentGoalId: string;
  description?: string;
  weight: number; // 1-10 influence weight
}

export interface PMProjectMilestone {
  id: string;
  goalId?: string;
  projectId: string;
  title: string;
  description?: string;
  type: MilestoneType;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  criteria: MilestoneCriteria[];
  deliverables: MilestoneDeliverable[];
  dependencies: string[]; // Other milestone IDs
  assignedTo: string[];
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export type MilestoneType = 
  | 'deadline' 
  | 'checkpoint' 
  | 'deliverable' 
  | 'review' 
  | 'approval' 
  | 'launch' 
  | 'custom';

export type MilestoneStatus = 
  | 'upcoming' 
  | 'in_progress' 
  | 'completed' 
  | 'missed' 
  | 'cancelled';

export interface MilestoneCriteria {
  id: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  evidence?: string[];
}

export interface MilestoneDeliverable {
  id: string;
  name: string;
  description?: string;
  type: 'document' | 'code' | 'design' | 'data' | 'approval' | 'other';
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'delivered';
  assignedTo?: string;
  dueDate?: Date;
  fileAttachments: string[];
}

export interface GoalKPI {
  id: string;
  name: string;
  description?: string;
  formula: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  source: 'manual' | 'automated' | 'integration';
  lastUpdated: Date;
}

export interface GoalMetadata {
  okrQuarter?: string;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'low' | 'medium' | 'high';
  confidenceLevel: number; // 1-10
  stakeholders: string[];
  tags: string[];
}

// Time Tracking with Built-in Timers
export interface TimeTrackingSession {
  id: string;
  userId: string;
  workspaceId: string;
  entityType: 'task' | 'project' | 'goal' | 'milestone';
  entityId: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  isActive: boolean;
  isManual: boolean;
  billable: boolean;
  billableRate?: number;
  currency?: string;
  tags: string[];
  location?: string;
  screenshots?: string[]; // For productivity tracking
  activityLevel?: number; // 0-100 based on keyboard/mouse activity
  breaks: TimeBreak[];
  metadata: TimeTrackingMetadata;
}

export interface TimeBreak {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: 'break' | 'lunch' | 'meeting' | 'interruption' | 'other';
  reason?: string;
}

export interface TimeTrackingMetadata {
  source: 'timer' | 'manual' | 'integration' | 'mobile';
  device?: string;
  timezone: string;
  roundingRules?: string;
  approval: {
    required: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export interface TimeReport {
  id: string;
  workspaceId: string;
  generatedBy: string;
  generatedAt: Date;
  period: TimePeriod;
  scope: TimeReportScope;
  filters: TimeReportFilters;
  summary: TimeReportSummary;
  details: TimeReportDetail[];
  exportFormat?: 'pdf' | 'excel' | 'csv';
}

export interface TimePeriod {
  start: Date;
  end: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
}

export interface TimeReportScope {
  includeUsers?: string[];
  includeProjects?: string[];
  includeTasks?: string[];
  billableOnly?: boolean;
  approvedOnly?: boolean;
}

export interface TimeReportFilters {
  tags?: string[];
  clients?: string[];
  activities?: string[];
  minDuration?: number;
  maxDuration?: number;
}

export interface TimeReportSummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalRevenue: number;
  averageHourlyRate: number;
  productivity: number; // 0-100
  utilizationRate: number; // 0-100
}

export interface TimeReportDetail {
  date: Date;
  userId: string;
  userName: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  description: string;
  duration: number;
  billableHours: number;
  rate?: number;
  revenue?: number;
  tags: string[];
}

// Resource Management
export interface PMProjectResource {
  id: string;
  projectId: string;
  workspaceId: string;
  name: string;
  type: ResourceType;
  category: ResourceCategory;
  status: ResourceStatus;
  availability: PMResourceAvailability;
  allocation: ResourceAllocation[];
  cost: ResourceCost;
  skills: ResourceSkill[];
  capacity: ResourceCapacity;
  utilization: ResourceUtilization;
  metadata: ResourceMetadata;
}

export type ResourceType = 
  | 'human' 
  | 'equipment' 
  | 'software' 
  | 'facility' 
  | 'material' 
  | 'budget' 
  | 'external';

export type ResourceCategory = 
  | 'developer' 
  | 'designer' 
  | 'manager' 
  | 'analyst' 
  | 'qa' 
  | 'devops' 
  | 'specialist' 
  | 'consultant';

export type ResourceStatus = 
  | 'available' 
  | 'busy' 
  | 'overallocated' 
  | 'unavailable' 
  | 'on_leave' 
  | 'terminated';

export interface PMResourceAvailability {
  startDate: Date;
  endDate?: Date;
  hoursPerWeek: number;
  workingDays: string[]; // ['monday', 'tuesday', ...]
  timeZone: string;
  holidays: Date[];
  vacations: VacationPeriod[];
}

export interface VacationPeriod {
  startDate: Date;
  endDate: Date;
  type: 'vacation' | 'sick' | 'training' | 'conference' | 'other';
  isApproved: boolean;
}

export interface ResourceAllocation {
  projectId: string;
  startDate: Date;
  endDate: Date;
  percentage: number; // 0-100
  role: string;
  responsibilities: string[];
  priority: number; // 1-10, higher = more important
}

export interface ResourceCost {
  hourlyRate?: number;
  dailyRate?: number;
  monthlyRate?: number;
  currency: string;
  costCenter?: string;
  budgetCode?: string;
  isExternal: boolean;
}

export interface ResourceSkill {
  name: string;
  level: SkillLevel;
  yearsExperience: number;
  certifications: string[];
  lastUsed?: Date;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ResourceCapacity {
  totalHours: number;
  allocatedHours: number;
  availableHours: number;
  overallocation: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface ResourceUtilization {
  targetUtilization: number; // 0-100
  actualUtilization: number; // 0-100
  billableUtilization: number; // 0-100
  efficiency: number; // 0-100
  lastCalculated: Date;
}

export interface ResourceMetadata {
  department?: string;
  location?: string;
  manager?: string;
  seniorityLevel?: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  contractType?: 'fulltime' | 'parttime' | 'contractor' | 'intern';
  tags: string[];
}

// Project Templates and Recurring Workflows
export interface ProjectTemplate {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  type: TemplateType;
  visibility: 'public' | 'workspace' | 'private';
  tags: string[];
  structure: ProjectStructure;
  defaultSettings: ProjectDefaultSettings;
  automation: TemplateAutomation;
  resources: TemplateResourceRequirement[];
  estimations: ProjectEstimation;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
  reviews: TemplateReview[];
}

export type TemplateCategory = 
  | 'software_development' 
  | 'marketing' 
  | 'design' 
  | 'research' 
  | 'operations' 
  | 'hr' 
  | 'finance' 
  | 'legal' 
  | 'general';

export type TemplateType = 
  | 'project' 
  | 'checklist' 
  | 'workflow' 
  | 'process' 
  | 'campaign' 
  | 'sprint' 
  | 'release';

export interface ProjectStructure {
  phases: TemplatePhase[];
  milestones: TemplateMilestone[];
  tasks: TemplateTask[];
  dependencies: TemplateDependency[];
  workflows: TemplateWorkflow[];
}

export interface TemplatePhase {
  id: string;
  name: string;
  description?: string;
  order: number;
  estimatedDuration: number; // in days
  isOptional: boolean;
  prerequisites: string[];
  deliverables: string[];
}

export interface TemplateMilestone {
  id: string;
  phaseId?: string;
  name: string;
  description?: string;
  type: MilestoneType;
  daysFromStart: number;
  criteria: string[];
  isRequired: boolean;
}

export interface TemplateTask {
  id: string;
  phaseId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiredSkills: string[];
  dependencies: string[];
  isOptional: boolean;
  category: string;
}

export interface TemplateDependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number; // in days
}

export interface TemplateWorkflow {
  id: string;
  name: string;
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isEnabled: boolean;
}

export interface WorkflowTrigger {
  type: 'task_completed' | 'milestone_reached' | 'date_reached' | 'status_changed' | 'custom';
  parameters: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: 'create_task' | 'update_status' | 'send_notification' | 'assign_user' | 'set_due_date';
  parameters: Record<string, any>;
  delay?: number; // in hours
}

export interface ProjectDefaultSettings {
  defaultAssignee?: string;
  workingDays: string[];
  workingHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  timeZone: string;
  currency: string;
  budgetBuffer: number; // percentage
  riskBuffer: number;   // percentage
}

export interface TemplateAutomation {
  autoAssignTasks: boolean;
  autoSetDueDates: boolean;
  autoCreateDependencies: boolean;
  autoStartWorkflows: boolean;
  notifications: TemplateNotificationRule[];
}

export interface TemplateNotificationRule {
  trigger: string;
  recipients: string[];
  message: string;
  delay?: number; // in hours
}

export interface TemplateResourceRequirement {
  role: string;
  skills: string[];
  experience: SkillLevel;
  allocation: number; // percentage
  duration: number;   // in days
  isCritical: boolean;
}

export interface ProjectEstimation {
  duration: EstimationRange;
  effort: EstimationRange;
  cost: EstimationRange;
  confidence: number; // 0-100
  methodology: 'expert' | 'historical' | 'parametric' | 'analogous';
  assumptions: string[];
  risks: EstimationRisk[];
}

export interface EstimationRange {
  min: number;
  most_likely: number;
  max: number;
  unit: string;
}

export interface EstimationRisk {
  description: string;
  probability: number; // 0-100
  impact: number;      // 0-100
  mitigation: string;
}

export interface TemplateReview {
  id: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  isVerified: boolean;
}

// Recurring Workflows
export interface RecurringWorkflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  templateId?: string;
  schedule: RecurrenceSchedule;
  automation: WorkflowAutomation;
  status: 'active' | 'paused' | 'stopped';
  nextRun: Date;
  lastRun?: Date;
  runHistory: WorkflowRun[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurrenceSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: string[];
  dayOfMonth?: number;
  weekOfMonth?: number;
  monthOfYear?: number;
  timeOfDay: string; // HH:MM
  timeZone: string;
  endDate?: Date;
  maxOccurrences?: number;
}

export interface WorkflowAutomation {
  autoStart: boolean;
  autoAssign: boolean;
  notifications: RecurringNotification[];
  customRules: CustomAutomationRule[];
}

export interface RecurringNotification {
  type: 'before_start' | 'on_start' | 'on_completion' | 'on_failure';
  recipients: string[];
  message: string;
  offsetHours?: number;
}

export interface CustomAutomationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  parameters: Record<string, any>;
  isEnabled: boolean;
}

export interface WorkflowRun {
  id: string;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  projectId?: string;
  errors?: string[];
  metrics: WorkflowRunMetrics;
}

export interface WorkflowRunMetrics {
  tasksCreated: number;
  assignmentsCreated: number;
  notificationsSent: number;
  duration: number; // in seconds
  success: boolean;
}

export {
  // Re-export collaboration types
  type TeamMember,
  type Comment,
  type FileAttachment,
  type ActivityFeedItem,
  type InAppNotification,
} from './collaboration';
