import { EventEmitter } from 'events';

export interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'webhook' | 'oauth' | 'api-key' | 'saml';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  config: Record<string, any>;
  capabilities: string[];
  icon?: string;
  category: 'productivity' | 'communication' | 'storage' | 'automation' | 'analytics';
}

export interface WebhookEvent {
  id: string;
  event: string;
  timestamp: Date;
  data: any;
  source: string;
  processed: boolean;
}

export interface IntegrationEvent {
  type: 'connection_established' | 'connection_lost' | 'data_sync' | 'webhook_received' | 'error';
  integrationId: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

// Client-side safe EventEmitter
class ClientSafeEventEmitter {
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  on(event: string, listener: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: (...args: any[]) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

class IntegrationHubService extends ClientSafeEventEmitter {
  private integrations: Map<string, Integration> = new Map();
  private webhookEvents: WebhookEvent[] = [];
  private eventHistory: IntegrationEvent[] = [];
  private isClient: boolean;

  constructor() {
    super();
    this.isClient = typeof window !== 'undefined';
    this.initializeDefaultIntegrations();
  }

  private initializeDefaultIntegrations() {
    // Slack Integration
    this.registerIntegration({
      id: 'slack',
      name: 'Slack',
      description: 'Real-time team communication and notifications',
      type: 'webhook',
      status: 'disconnected',
      config: {},
      capabilities: ['notifications', 'channel-posts', 'direct-messages'],
      icon: '💬',
      category: 'communication'
    });

    // Microsoft Teams Integration
    this.registerIntegration({
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Microsoft Teams integration for collaboration',
      type: 'oauth',
      status: 'disconnected',
      config: {},
      capabilities: ['notifications', 'channel-posts', 'file-sharing'],
      icon: '👥',
      category: 'communication'
    });

    // Google Drive Integration
    this.registerIntegration({
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Cloud storage and file synchronization',
      type: 'oauth',
      status: 'disconnected',
      config: {},
      capabilities: ['file-upload', 'file-sync', 'sharing'],
      icon: '📁',
      category: 'storage'
    });

    // Zapier Integration
    this.registerIntegration({
      id: 'zapier',
      name: 'Zapier',
      description: 'Automation workflows and triggers',
      type: 'webhook',
      status: 'disconnected',
      config: {},
      capabilities: ['automation', 'triggers', 'actions'],
      icon: '⚡',
      category: 'automation'
    });

    // Trello Integration
    this.registerIntegration({
      id: 'trello',
      name: 'Trello',
      description: 'Project management and task tracking',
      type: 'api-key',
      status: 'disconnected',
      config: {},
      capabilities: ['task-creation', 'board-sync', 'card-updates'],
      icon: '📋',
      category: 'productivity'
    });

    // GitHub Integration
    this.registerIntegration({
      id: 'github',
      name: 'GitHub',
      description: 'Version control and issue tracking',
      type: 'oauth',
      status: 'disconnected',
      config: {},
      capabilities: ['issue-creation', 'pull-requests', 'repository-sync'],
      icon: '🐙',
      category: 'productivity'
    });

    // JIRA Integration
    this.registerIntegration({
      id: 'jira',
      name: 'JIRA',
      description: 'Issue tracking and project management',
      type: 'api-key',
      status: 'disconnected',
      config: {},
      capabilities: ['issue-creation', 'status-updates', 'project-sync'],
      icon: '🎯',
      category: 'productivity'
    });

    // Email Integration
    this.registerIntegration({
      id: 'email',
      name: 'Email Notifications',
      description: 'Send email notifications and reports',
      type: 'api-key',
      status: 'disconnected',
      config: {},
      capabilities: ['notifications', 'reports', 'alerts'],
      icon: '📧',
      category: 'communication'
    });
  }

  registerIntegration(integration: Integration): void {
    this.integrations.set(integration.id, integration);
    this.emitEvent({
      type: 'connection_established',
      integrationId: integration.id,
      timestamp: new Date()
    });
  }

  async connectIntegration(integrationId: string, config: Record<string, any>): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    try {
      // Validate configuration based on integration type
      await this.validateIntegrationConfig(integration, config);
      
      integration.config = { ...integration.config, ...config };
      integration.status = 'connected';
      
      this.emitEvent({
        type: 'connection_established',
        integrationId,
        data: { config },
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      integration.status = 'error';
      this.emitEvent({
        type: 'error',
        integrationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  async disconnectIntegration(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    integration.status = 'disconnected';
    integration.config = {};

    this.emitEvent({
      type: 'connection_lost',
      integrationId,
      timestamp: new Date()
    });
  }

  private async validateIntegrationConfig(integration: Integration, config: Record<string, any>): Promise<void> {
    switch (integration.type) {
      case 'webhook':
        if (!config.webhookUrl) {
          throw new Error('Webhook URL is required');
        }
        break;
      case 'api-key':
        if (!config.apiKey) {
          throw new Error('API Key is required');
        }
        break;
      case 'oauth':
        if (!config.clientId || !config.clientSecret) {
          throw new Error('OAuth client credentials are required');
        }
        break;
      case 'saml':
        if (!config.entityId || !config.ssoUrl) {
          throw new Error('SAML configuration is incomplete');
        }
        break;
    }
  }

  async handleWebhook(integrationId: string, event: string, data: any): Promise<void> {
    const webhookEvent: WebhookEvent = {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event,
      timestamp: new Date(),
      data,
      source: integrationId,
      processed: false
    };

    this.webhookEvents.push(webhookEvent);

    // Process webhook based on integration and event type
    await this.processWebhookEvent(webhookEvent);

    this.emitEvent({
      type: 'webhook_received',
      integrationId,
      data: { event, webhookData: data },
      timestamp: new Date()
    });
  }

  private async processWebhookEvent(webhookEvent: WebhookEvent): Promise<void> {
    const integration = this.integrations.get(webhookEvent.source);
    if (!integration || integration.status !== 'connected') {
      return;
    }

    try {
      switch (webhookEvent.source) {
        case 'slack':
          await this.processSlackWebhook(webhookEvent);
          break;
        case 'zapier':
          await this.processZapierWebhook(webhookEvent);
          break;
        case 'github':
          await this.processGitHubWebhook(webhookEvent);
          break;
        default:
          console.log(`No handler for ${webhookEvent.source} webhook`);
      }

      webhookEvent.processed = true;
    } catch (error) {
      console.error(`Error processing webhook from ${webhookEvent.source}:`, error);
      this.emitEvent({
        type: 'error',
        integrationId: webhookEvent.source,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
        timestamp: new Date()
      });
    }
  }

  private async processSlackWebhook(webhookEvent: WebhookEvent): Promise<void> {
    // Process Slack webhook events
    console.log('Processing Slack webhook:', webhookEvent);
  }

  private async processZapierWebhook(webhookEvent: WebhookEvent): Promise<void> {
    // Process Zapier webhook events
    console.log('Processing Zapier webhook:', webhookEvent);
  }

  private async processGitHubWebhook(webhookEvent: WebhookEvent): Promise<void> {
    // Process GitHub webhook events
    console.log('Processing GitHub webhook:', webhookEvent);
  }

  async triggerAction(integrationId: string, action: string, data: any): Promise<any> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.status !== 'connected') {
      throw new Error(`Integration ${integrationId} not available`);
    }

    try {
      let result;
      switch (integrationId) {
        case 'slack':
          result = await this.triggerSlackAction(action, data, integration.config);
          break;
        case 'teams':
          result = await this.triggerTeamsAction(action, data, integration.config);
          break;
        case 'google-drive':
          result = await this.triggerGoogleDriveAction(action, data, integration.config);
          break;
        case 'zapier':
          result = await this.triggerZapierAction(action, data, integration.config);
          break;
        case 'trello':
          result = await this.triggerTrelloAction(action, data, integration.config);
          break;
        case 'github':
          result = await this.triggerGitHubAction(action, data, integration.config);
          break;
        case 'jira':
          result = await this.triggerJiraAction(action, data, integration.config);
          break;
        case 'email':
          result = await this.triggerEmailAction(action, data, integration.config);
          break;
        default:
          throw new Error(`No action handler for ${integrationId}`);
      }

      this.emitEvent({
        type: 'data_sync',
        integrationId,
        data: { action, result },
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      this.emitEvent({
        type: 'error',
        integrationId,
        error: error instanceof Error ? error.message : 'Action failed',
        timestamp: new Date()
      });
      throw error;
    }
  }

  private async triggerSlackAction(action: string, data: any, config: any): Promise<any> {
    // Implement Slack actions
    console.log('Triggering Slack action:', action, data);
    return { success: true, action, data };
  }

  private async triggerTeamsAction(action: string, data: any, config: any): Promise<any> {
    // Implement Teams actions
    console.log('Triggering Teams action:', action, data);
    return { success: true, action, data };
  }

  private async triggerGoogleDriveAction(action: string, data: any, config: any): Promise<any> {
    // Implement Google Drive actions
    console.log('Triggering Google Drive action:', action, data);
    return { success: true, action, data };
  }

  private async triggerZapierAction(action: string, data: any, config: any): Promise<any> {
    // Implement Zapier actions
    console.log('Triggering Zapier action:', action, data);
    return { success: true, action, data };
  }

  private async triggerTrelloAction(action: string, data: any, config: any): Promise<any> {
    // Implement Trello actions
    console.log('Triggering Trello action:', action, data);
    return { success: true, action, data };
  }

  private async triggerGitHubAction(action: string, data: any, config: any): Promise<any> {
    // Implement GitHub actions
    console.log('Triggering GitHub action:', action, data);
    return { success: true, action, data };
  }

  private async triggerJiraAction(action: string, data: any, config: any): Promise<any> {
    // Implement JIRA actions
    console.log('Triggering JIRA action:', action, data);
    return { success: true, action, data };
  }

  private async triggerEmailAction(action: string, data: any, config: any): Promise<any> {
    // Implement Email actions
    console.log('Triggering Email action:', action, data);
    return { success: true, action, data };
  }

  private emitEvent(event: IntegrationEvent): void {
    this.eventHistory.push(event);
    if (this.isClient) {
      this.emit('integration_event', event);
    }
  }

  getIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  getConnectedIntegrations(): Integration[] {
    return this.getIntegrations().filter(integration => integration.status === 'connected');
  }

  getWebhookEvents(): WebhookEvent[] {
    return this.webhookEvents;
  }

  getEventHistory(): IntegrationEvent[] {
    return this.eventHistory;
  }

  getIntegrationsByCategory(category: string): Integration[] {
    return this.getIntegrations().filter(integration => integration.category === category);
  }

  async testConnection(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    try {
      // Implement connection testing logic for each integration type
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate test
      return true;
    } catch (error) {
      this.emitEvent({
        type: 'error',
        integrationId,
        error: 'Connection test failed',
        timestamp: new Date()
      });
      return false;
    }
  }
}

// Create a singleton instance that's safe for SSR
let integrationHubInstance: IntegrationHubService | null = null;

export const integrationHub = (() => {
  if (typeof window === 'undefined') {
    // Server-side: return a minimal object that won't cause hydration mismatches
    return {
      getIntegrations: () => [],
      getIntegration: () => undefined,
      getConnectedIntegrations: () => [],
      getWebhookEvents: () => [],
      getEventHistory: () => [],
      getIntegrationsByCategory: () => [],
      connectIntegration: async () => false,
      disconnectIntegration: async () => {},
      testConnection: async () => false,
      triggerAction: async () => null,
      handleWebhook: async () => {},
      on: () => {},
      off: () => {},
      emit: () => {},
      removeAllListeners: () => {}
    } as any;
  }
  
  // Client-side: return the actual service
  if (!integrationHubInstance) {
    integrationHubInstance = new IntegrationHubService();
  }
  return integrationHubInstance;
})();
export default integrationHub;
