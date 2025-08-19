// AI Services Index
// Centralized exports for all AI-related services

export { aiService, AIService } from './AIService';

// Re-export service types for easier imports
export type {
  AITaskPriority,
  AITaskSuggestion,
  AIInsights,
  SmartNotification,
  AITemplateGeneration
} from '../../types/ai';

// Service configuration
export interface AIServiceConfig {
  provider: 'openai' | 'aws-bedrock' | 'azure-openai' | 'anthropic';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  region?: string; // For AWS services
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
  };
}

// Default configuration
export const defaultAIConfig: AIServiceConfig = {
  provider: 'aws-bedrock',
  model: 'anthropic.claude-3-sonnet-20240229-v1:0',
  temperature: 0.7,
  maxTokens: 4096,
  region: 'us-east-1'
};

// AI Service utilities
export const AIServiceUtils = {
  validateConfig: (config: AIServiceConfig): boolean => {
    if (!config.provider) return false;
    
    switch (config.provider) {
      case 'aws-bedrock':
        return !!(config.region && (config.credentials || process.env.AWS_ACCESS_KEY_ID));
      case 'openai':
        return !!(config.apiKey || process.env.OPENAI_API_KEY);
      case 'azure-openai':
        return !!(config.apiKey && config.endpoint);
      case 'anthropic':
        return !!(config.apiKey || process.env.ANTHROPIC_API_KEY);
      default:
        return false;
    }
  },

  formatError: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'An unknown error occurred';
  },

  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },

  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 10000); // Limit input length
  },

  calculateTokens: (text: string): number => {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
};

// AI Analytics tracker
export class AIAnalyticsTracker {
  private events: Array<{
    timestamp: Date;
    event: string;
    data: any;
    userId?: string;
    workspaceId?: string;
  }> = [];

  track(event: string, data: any, userId?: string, workspaceId?: string) {
    this.events.push({
      timestamp: new Date(),
      event,
      data,
      userId,
      workspaceId
    });

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics({
        timestamp: new Date(),
        event,
        data,
        userId,
        workspaceId
      });
    }
  }

  private async sendToAnalytics(eventData: any) {
    try {
      // Send to your analytics service (e.g., AWS CloudWatch, Google Analytics, etc.)
      console.log('AI Analytics Event:', eventData);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  getEvents(filters?: {
    userId?: string;
    workspaceId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let filteredEvents = this.events;

    if (filters) {
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filters.userId);
      }
      if (filters.workspaceId) {
        filteredEvents = filteredEvents.filter(e => e.workspaceId === filters.workspaceId);
      }
      if (filters.eventType) {
        filteredEvents = filteredEvents.filter(e => e.event === filters.eventType);
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endDate!);
      }
    }

    return filteredEvents;
  }

  clear() {
    this.events = [];
  }
}

// Global analytics tracker instance
export const aiAnalytics = new AIAnalyticsTracker();

// AI Service status
export interface AIServiceStatus {
  available: boolean;
  provider: string;
  model: string;
  lastChecked: Date;
  error?: string;
  latency?: number;
  tokensUsed?: number;
  requestsCount?: number;
}

// Service health checker
export class AIServiceHealthChecker {
  private status: AIServiceStatus = {
    available: false,
    provider: 'unknown',
    model: 'unknown',
    lastChecked: new Date()
  };

  async checkHealth(config: AIServiceConfig): Promise<AIServiceStatus> {
    const startTime = Date.now();
    
    try {
      // Simple health check - attempt to generate a minimal response
      const testPrompt = "Respond with just 'OK' if you can process this request.";
      
      // This would use the actual AI service to test connectivity
      // For now, we'll simulate a health check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const latency = Date.now() - startTime;
      
      this.status = {
        available: true,
        provider: config.provider,
        model: config.model || 'default',
        lastChecked: new Date(),
        latency,
        tokensUsed: 0,
        requestsCount: 0
      };
    } catch (error) {
      this.status = {
        available: false,
        provider: config.provider,
        model: config.model || 'default',
        lastChecked: new Date(),
        error: AIServiceUtils.formatError(error)
      };
    }

    return this.status;
  }

  getStatus(): AIServiceStatus {
    return { ...this.status };
  }

  isHealthy(): boolean {
    return this.status.available && !this.status.error;
  }
}

// Global health checker instance
export const aiHealthChecker = new AIServiceHealthChecker();
