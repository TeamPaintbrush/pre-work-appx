// Advanced Template Features Types
// Comprehensive type definitions for enhanced template functionality

// Core Advanced Template Types
export interface AdvancedTemplate extends ChecklistTemplate {
  variables: TemplateVariable[];
  conditionalSteps: ConditionalStep[];
  dynamicContent: DynamicContent[];
  workflowSteps: WorkflowStep[];
  qualityMetrics: TemplateQualityMetrics;
  personalization: PersonalizationConfig;
  analytics: TemplateAnalytics;
}

// Template Variables for Dynamic Content
export interface TemplateVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'time' | 'file' | 'url';
  label: string;
  description?: string;
  defaultValue?: any;
  required: boolean;
  validation?: ValidationRule[];
  options?: VariableOption[];
  placeholder?: string;
  helpText?: string;
  group?: string;
  dependencies?: VariableDependency[];
  isSystem?: boolean;
}

export interface VariableOption {
  label: string;
  value: any;
  description?: string;
  icon?: string;
  disabled?: boolean;
  group?: string;
}

export interface VariableDependency {
  variableId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value?: any;
  action: 'show' | 'hide' | 'require' | 'disable' | 'set_value';
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'min_value' | 'max_value' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any, variables: Record<string, any>) => boolean;
}

// Conditional Steps
export interface ConditionalStep {
  id: string;
  stepId: string;
  conditions: StepCondition[];
  logicalOperator: 'AND' | 'OR';
  action: 'show' | 'hide' | 'require' | 'skip' | 'modify';
  modificationData?: Partial<ChecklistItem>;
  priority: number;
}

export interface StepCondition {
  type: 'variable' | 'previous_step' | 'user_role' | 'device_type' | 'time' | 'location' | 'custom';
  variableId?: string;
  stepId?: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists';
  value?: any;
  customEvaluator?: (context: TemplateContext) => boolean;
}

// Dynamic Content
export interface DynamicContent {
  id: string;
  targetType: 'title' | 'description' | 'instruction' | 'note' | 'link' | 'image' | 'video' | 'custom';
  targetId: string;
  contentTemplate: string;
  variables: string[];
  conditions?: DynamicContentCondition[];
  fallbackContent?: string;
  contentType: 'text' | 'html' | 'markdown' | 'json';
  formatters?: ContentFormatter[];
}

export interface DynamicContentCondition {
  variableId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  content: string;
}

export interface ContentFormatter {
  type: 'capitalize' | 'uppercase' | 'lowercase' | 'date_format' | 'number_format' | 'currency' | 'custom';
  options?: Record<string, any>;
  customFormatter?: (value: any) => string;
}

// Workflow Steps
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'form' | 'review' | 'approval' | 'notification' | 'integration' | 'calculation' | 'decision';
  order: number;
  required: boolean;
  estimatedDuration?: number;
  assignee?: WorkflowAssignee;
  inputs: WorkflowInput[];
  outputs: WorkflowOutput[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  integrations?: WorkflowIntegration[];
}

export interface WorkflowAssignee {
  type: 'user' | 'role' | 'system' | 'external';
  id?: string;
  email?: string;
  name?: string;
  autoAssign?: boolean;
}

export interface WorkflowInput {
  id: string;
  name: string;
  type: string;
  required: boolean;
  source: 'variable' | 'previous_step' | 'user_input' | 'system' | 'integration';
  sourceId?: string;
  validation?: ValidationRule[];
}

export interface WorkflowOutput {
  id: string;
  name: string;
  type: string;
  destination: 'variable' | 'next_step' | 'system' | 'integration';
  destinationId?: string;
  transformation?: DataTransformation;
}

export interface WorkflowAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'notify' | 'integrate' | 'calculate' | 'validate';
  target: string;
  parameters: Record<string, any>;
  conditions?: ActionCondition[];
  retryPolicy?: RetryPolicy;
}

export interface WorkflowCondition {
  id: string;
  expression: string;
  trueAction: string;
  falseAction?: string;
  variables: string[];
}

export interface WorkflowIntegration {
  id: string;
  provider: string;
  action: string;
  configuration: Record<string, any>;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  errorHandling: ErrorHandlingConfig;
}

// Template Quality & Analytics
export interface TemplateQualityMetrics {
  overallScore: number;
  completeness: number;
  clarity: number;
  usability: number;
  efficiency: number;
  accessibility: number;
  mobileOptimization: number;
  lastEvaluated: Date;
  evaluationCriteria: QualityEvaluationCriteria[];
  recommendations: QualityRecommendation[];
}

export interface QualityEvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  description: string;
  suggestions: string[];
}

export interface QualityRecommendation {
  id: string;
  type: 'improvement' | 'best_practice' | 'optimization' | 'accessibility' | 'mobile';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number;
  implementationComplexity: 'easy' | 'medium' | 'hard';
}

export interface TemplateAnalytics {
  usageStats: TemplateUsageStats;
  performanceMetrics: TemplatePerformanceMetrics;
  userFeedback: TemplateFeedback[];
  completionAnalytics: CompletionAnalytics;
  errorAnalytics: ErrorAnalytics;
}

export interface TemplateUsageStats {
  totalUsage: number;
  uniqueUsers: number;
  averageCompletionTime: number;
  popularVariations: VariationUsage[];
  deviceBreakdown: DeviceUsage[];
  timeBasedUsage: TimeBasedUsage[];
  geographicUsage: GeographicUsage[];
}

export interface TemplatePerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionLatency: number;
  errorRate: number;
  abandonmentRate: number;
  satisfactionScore: number;
  npsScore?: number;
}

// Personalization
export interface PersonalizationConfig {
  enabled: boolean;
  userProfiles: UserProfileMapping[];
  adaptiveContent: AdaptiveContentRule[];
  learningEnabled: boolean;
  privacySettings: PrivacySettings;
}

export interface UserProfileMapping {
  profileId: string;
  profileName: string;
  variables: Record<string, any>;
  preferences: UserPreferences;
  restrictions: UserRestrictions[];
}

export interface AdaptiveContentRule {
  id: string;
  trigger: AdaptiveTrigger;
  adaptation: ContentAdaptation;
  enabled: boolean;
  testingEnabled?: boolean;
}

export interface AdaptiveTrigger {
  type: 'user_behavior' | 'completion_rate' | 'error_rate' | 'time_spent' | 'device_type' | 'location';
  condition: string;
  threshold?: number;
}

export interface ContentAdaptation {
  type: 'content_simplification' | 'step_reordering' | 'additional_help' | 'visual_enhancement' | 'interaction_change';
  parameters: Record<string, any>;
  reversible: boolean;
}

// Supporting Types
export interface TemplateContext {
  userId: string;
  workspaceId: string;
  templateId: string;
  variables: Record<string, any>;
  userProfile: UserProfile;
  environment: EnvironmentContext;
  previousSteps: CompletedStep[];
  currentStep?: string;
}

export interface EnvironmentContext {
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browserType: string;
  operatingSystem: string;
  screenSize: ScreenSize;
  connectivity: ConnectivityInfo;
  location?: LocationInfo;
  timezone: string;
  language: string;
}

export interface UserProfile {
  id: string;
  role: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferences: UserPreferences;
  accessibility: AccessibilityNeeds;
  completionHistory: TemplateCompletionHistory[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  stepAnimation: boolean;
  autoSave: boolean;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface AccessibilityNeeds {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  colorBlindness?: 'protanopia' | 'deuteranopia' | 'tritanopia';
}

// Template Enhancement Services
export interface TemplateEnhancementService {
  enhanceTemplate(template: ChecklistTemplate, context: TemplateContext): Promise<AdvancedTemplate>;
  evaluateVariables(variables: TemplateVariable[], values: Record<string, any>): Promise<VariableEvaluationResult>;
  processConditionalSteps(conditionalSteps: ConditionalStep[], context: TemplateContext): Promise<ProcessedStep[]>;
  generateDynamicContent(dynamicContent: DynamicContent[], context: TemplateContext): Promise<GeneratedContent[]>;
  executeWorkflowStep(step: WorkflowStep, context: TemplateContext): Promise<WorkflowStepResult>;
  calculateQualityMetrics(template: AdvancedTemplate): Promise<TemplateQualityMetrics>;
  personalizeTemplate(template: AdvancedTemplate, userProfile: UserProfile): Promise<AdvancedTemplate>;
  trackUsage(templateId: string, userId: string, action: string, metadata?: Record<string, any>): Promise<void>;
}

// Results and Responses
export interface VariableEvaluationResult {
  isValid: boolean;
  validatedValues: Record<string, any>;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  dependencies: ResolvedDependency[];
}

export interface ProcessedStep {
  stepId: string;
  action: 'show' | 'hide' | 'require' | 'skip' | 'modify';
  modifications?: Partial<ChecklistItem>;
  reasoning: string;
}

export interface GeneratedContent {
  targetId: string;
  content: string;
  contentType: string;
  generatedAt: Date;
  variables: Record<string, any>;
}

export interface WorkflowStepResult {
  stepId: string;
  status: 'completed' | 'pending' | 'failed' | 'skipped';
  outputs: Record<string, any>;
  errors?: WorkflowError[];
  duration: number;
  nextStep?: string;
}

// Error Handling
export interface ValidationError {
  variableId: string;
  rule: string;
  message: string;
  value: any;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  variableId: string;
  message: string;
  suggestion?: string;
}

export interface WorkflowError {
  stepId: string;
  actionId?: string;
  type: 'validation' | 'integration' | 'system' | 'user';
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

// Utility Types
export interface DataTransformation {
  type: 'map' | 'filter' | 'reduce' | 'format' | 'validate' | 'custom';
  parameters: Record<string, any>;
  customTransformer?: (data: any) => any;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

export interface ErrorHandlingConfig {
  onError: 'retry' | 'skip' | 'fail' | 'fallback' | 'manual';
  fallbackValue?: any;
  notifyOnError: boolean;
  logErrors: boolean;
}

export interface ActionCondition {
  expression: string;
  variables: string[];
  type: 'pre' | 'post';
}

// Import base types
export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  items: ChecklistItem[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  required: boolean;
  category?: string;
  estimatedTime?: number;
  instructions?: string;
  resources?: string[];
  dependencies?: string[];
  tags?: string[];
}

// Additional utility types
export interface ScreenSize {
  width: number;
  height: number;
  pixelRatio: number;
}

export interface ConnectivityInfo {
  type: 'wifi' | 'cellular' | 'ethernet' | 'offline';
  speed: 'slow' | 'medium' | 'fast';
  quality: number;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface NotificationPreferences {
  email: boolean;
  browser: boolean;
  mobile: boolean;
  desktop: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface PrivacyPreferences {
  shareUsageData: boolean;
  shareErrorReports: boolean;
  allowPersonalization: boolean;
  cookieConsent: boolean;
}

export interface PrivacySettings {
  dataRetention: number; // days
  anonymizeData: boolean;
  gdprCompliant: boolean;
  consentRequired: boolean;
  optOutAvailable: boolean;
}

export interface UserRestrictions {
  type: 'access' | 'modification' | 'sharing' | 'export';
  scope: string[];
  reason: string;
  expiresAt?: Date;
}

export interface TemplateCompletionHistory {
  templateId: string;
  completedAt: Date;
  completionTime: number;
  score?: number;
  feedback?: string;
}

export interface CompletedStep {
  stepId: string;
  completedAt: Date;
  value?: any;
  duration: number;
}

export interface ResolvedDependency {
  variableId: string;
  dependsOn: string[];
  resolved: boolean;
  value?: any;
}

export interface VariationUsage {
  variationId: string;
  usageCount: number;
  completionRate: number;
  averageTime: number;
}

export interface DeviceUsage {
  deviceType: string;
  usageCount: number;
  percentage: number;
  completionRate: number;
}

export interface TimeBasedUsage {
  period: string;
  usageCount: number;
  uniqueUsers: number;
  averageCompletionTime: number;
}

export interface GeographicUsage {
  region: string;
  usageCount: number;
  uniqueUsers: number;
  popularTemplates: string[];
}

export interface TemplateFeedback {
  userId: string;
  rating: number;
  comment?: string;
  category: 'usability' | 'content' | 'performance' | 'bugs' | 'feature_request';
  submittedAt: Date;
  helpful?: boolean;
}

export interface CompletionAnalytics {
  totalCompletions: number;
  averageCompletionRate: number;
  completionTimeDistribution: TimeDistribution[];
  dropOffPoints: DropOffPoint[];
  successFactors: SuccessFactor[];
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorTypes: ErrorTypeStats[];
  errorTrends: ErrorTrend[];
  impactAnalysis: ErrorImpact[];
}

export interface TimeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface DropOffPoint {
  stepId: string;
  dropOffRate: number;
  userCount: number;
  commonReasons: string[];
}

export interface SuccessFactor {
  factor: string;
  correlation: number;
  impact: 'positive' | 'negative' | 'neutral';
  significance: number;
}

export interface ErrorTypeStats {
  type: string;
  count: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorTrend {
  date: Date;
  errorCount: number;
  errorRate: number;
  affectedUsers: number;
}

export interface ErrorImpact {
  errorType: string;
  completionImpact: number;
  userExperienceImpact: number;
  businessImpact: number;
}
