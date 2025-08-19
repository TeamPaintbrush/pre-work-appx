// AI Components Index
// Centralized exports for all AI-related components

export { AIDashboard } from './AIDashboard';
export { SmartPrioritization } from './SmartPrioritization';
export { AITaskSuggestions } from './AITaskSuggestions';
export { SmartProgressPrediction } from './SmartProgressPrediction';

// AI Dashboard types
export interface AIDashboardProps {
  workspaceId: string;
  userId: string;
  checklistId?: string;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    completed?: boolean;
    estimatedDuration?: number;
    dependencies?: string[];
    category?: string;
    tags?: string[];
    dueDate?: Date;
    assignedTo?: string;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  currentProgress?: {
    percentage: number;
    completedTasks: number;
    totalTasks: number;
    velocity?: number;
    timeSpent?: number;
  };
  className?: string;
}

// AI Feature Configuration
export interface AIFeatureConfig {
  enabled: boolean;
  provider: 'openai' | 'aws-bedrock' | 'azure-openai' | 'anthropic';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  customPrompts?: {
    taskPrioritization?: string;
    suggestionGeneration?: string;
    progressPrediction?: string;
    insightGeneration?: string;
  };
}

// AI Component Theme
export interface AITheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

// Default AI theme
export const defaultAITheme: AITheme = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#8B5CF6',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  borderColor: '#E5E7EB',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  gradients: {
    primary: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    secondary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    accent: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
  },
  animations: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// AI Component Provider Props
export interface AIProviderProps {
  children: React.ReactNode;
  config: AIFeatureConfig;
  theme?: AITheme;
  workspaceId: string;
  userId: string;
}

// AI Analytics Events
export type AIAnalyticsEvent = 
  | { type: 'ai_suggestion_viewed'; suggestionId: string; suggestionType: string }
  | { type: 'ai_suggestion_accepted'; suggestionId: string; suggestionType: string }
  | { type: 'ai_suggestion_rejected'; suggestionId: string; suggestionType: string }
  | { type: 'ai_prioritization_applied'; taskCount: number; method: string }
  | { type: 'ai_progress_prediction_viewed'; checklistId: string; predictionAccuracy?: number }
  | { type: 'ai_insight_generated'; insightType: string; confidence: number }
  | { type: 'ai_dashboard_opened'; section: string }
  | { type: 'ai_dashboard_closed'; timeSpent: number };

// Utility functions
export const AIUtils = {
  formatConfidence: (confidence: number): string => {
    if (confidence >= 90) return 'Very High';
    if (confidence >= 70) return 'High';
    if (confidence >= 50) return 'Medium';
    if (confidence >= 30) return 'Low';
    return 'Very Low';
  },

  formatDuration: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },

  getPriorityColor: (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },

  getImpactColor: (impact: string): string => {
    switch (impact) {
      case 'transformational': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'high': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-green-600 bg-green-50 border-green-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },

  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
};
