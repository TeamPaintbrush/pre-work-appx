// AI/Smart Features Type Definitions
// Maintains enterprise structure with AWS integration

export interface AITaskPriority {
  id: string;
  taskId: string;
  workspaceId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  reasoning: string;
  factors: PriorityFactor[];
  suggestedOrder: number;
  estimatedCompletionTime: number; // minutes
  dependencies: string[];
  deadlineImpact: number; // 0-100
  resourceRequirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PriorityFactor {
  type: 'deadline' | 'dependencies' | 'complexity' | 'resources' | 'impact';
  weight: number; // 0-1
  value: number; // 0-100
  description: string;
}

export interface AITaskSuggestion {
  id: string;
  workspaceId: string;
  userId: string;
  type: 'next_task' | 'optimization' | 'workflow_improvement' | 'template_recommendation';
  title: string;
  description: string;
  suggestedAction: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'minimal' | 'low' | 'medium' | 'high';
  category: string;
  metadata: Record<string, any>;
  status: 'pending' | 'viewed' | 'accepted' | 'dismissed' | 'implemented';
  createdAt: Date;
  expiresAt?: Date;
}

export interface SmartScheduling {
  id: string;
  workspaceId: string;
  userId: string;
  taskId: string;
  suggestedStartTime: Date;
  suggestedEndTime: Date;
  estimatedDuration: number; // minutes
  availabilityScore: number; // 0-100
  workloadScore: number; // 0-100
  optimalTimeSlot: boolean;
  conflictWarnings: ConflictWarning[];
  reasoning: string;
  flexibility: 'rigid' | 'moderate' | 'flexible';
  createdAt: Date;
}

export interface ConflictWarning {
  type: 'deadline_conflict' | 'resource_conflict' | 'workload_overrun' | 'dependency_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedItems: string[];
  suggestedResolution: string;
}

export interface AITemplateGeneration {
  id: string;
  workspaceId: string;
  userId: string;
  generatedTemplate: {
    name: string;
    description: string;
    category: string;
    sections: any[];
    estimatedTime: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  sourceData: {
    industry: string;
    taskType: string;
    requirements: string[];
    regulations: string[];
  };
  confidence: number;
  qualityScore: number;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  feedback: string[];
  createdAt: Date;
}

export interface SmartProgress {
  id: string;
  workspaceId: string;
  checklistId: string;
  currentProgress: number; // 0-100
  predictedCompletion: Date;
  completionConfidence: number; // 0-100
  bottlenecks: Bottleneck[];
  recommendations: ProgressRecommendation[];
  velocity: number; // tasks per hour
  qualityScore: number; // 0-100
  riskFactors: RiskFactor[];
  optimizationOpportunities: OptimizationOpportunity[];
  lastAnalysis: Date;
}

export interface Bottleneck {
  type: 'resource' | 'dependency' | 'complexity' | 'approval' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedTasks: string[];
  estimatedDelay: number; // hours
  suggestedActions: string[];
  cost: number; // estimated cost of delay
}

export interface ProgressRecommendation {
  type: 'reorder_tasks' | 'allocate_resources' | 'adjust_deadlines' | 'seek_help' | 'simplify_approach';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  expectedImpact: string;
  implementationEffort: 'minimal' | 'low' | 'medium' | 'high';
  timeToImplement: number; // minutes
}

export interface RiskFactor {
  type: 'deadline_risk' | 'quality_risk' | 'resource_risk' | 'dependency_risk';
  probability: number; // 0-100
  impact: number; // 0-100
  description: string;
  mitigationStrategies: string[];
}

export interface OptimizationOpportunity {
  type: 'automation' | 'workflow_improvement' | 'template_enhancement' | 'training_need';
  description: string;
  potentialBenefit: string;
  estimatedTimeSaving: number; // hours per week
  implementationComplexity: 'low' | 'medium' | 'high';
}

export interface AIInsights {
  id: string;
  workspaceId: string;
  type: 'productivity' | 'quality' | 'efficiency' | 'team_performance' | 'predictive';
  title: string;
  insight: string;
  dataPoints: DataPoint[];
  confidence: number;
  actionable: boolean;
  suggestedActions: string[];
  impact: 'low' | 'medium' | 'high' | 'transformational';
  category: string;
  generatedAt: Date;
  relevantPeriod: {
    start: Date;
    end: Date;
  };
}

export interface DataPoint {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
  significance: 'low' | 'medium' | 'high';
}

export interface SmartNotification {
  id: string;
  workspaceId: string;
  userId: string;
  type: 'ai_suggestion' | 'smart_reminder' | 'optimization_alert' | 'predictive_warning';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  aiGenerated: boolean;
  personalized: boolean;
  metadata: Record<string, any>;
  scheduledFor: Date;
  deliveredAt?: Date;
  readAt?: Date;
  actionTaken?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

// AWS Integration Types
export interface AIAnalyticsEvent {
  eventId: string;
  workspaceId: string;
  userId: string;
  eventType: string;
  data: Record<string, any>;
  timestamp: Date;
  source: 'web' | 'mobile' | 'api';
  sessionId: string;
}

export interface AIModelConfig {
  modelId: string;
  version: string;
  type: 'prioritization' | 'scheduling' | 'template_generation' | 'progress_prediction';
  parameters: Record<string, any>;
  trainingData: string; // S3 bucket path
  accuracy: number;
  lastTrained: Date;
  isActive: boolean;
}

export interface AIProcessingJob {
  jobId: string;
  workspaceId: string;
  type: 'batch_analysis' | 'model_training' | 'data_processing' | 'insight_generation';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  outputLocation?: string; // S3 path
  metadata: Record<string, any>;
}

// Feature Toggle Integration
export interface AIFeatureConfig {
  enabled: boolean;
  featureId: string;
  description: string;
  dependencies: string[];
  requiresTraining: boolean;
  minimumDataPoints: number;
  confidenceThreshold: number;
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export type AIFeatureType = 
  | 'task_prioritization'
  | 'smart_scheduling'
  | 'template_generation'
  | 'progress_prediction'
  | 'optimization_suggestions'
  | 'intelligent_notifications'
  | 'quality_assessment'
  | 'workflow_automation';
