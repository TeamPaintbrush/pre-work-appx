import { useState, useEffect, useCallback } from 'react';
import { integrationHub, Integration, IntegrationEvent } from '../services/integrations/IntegrationHub';
import { webhookService } from '../services/integrations/WebhookService';

export interface UseIntegrationsResult {
  integrations: Integration[];
  connectedIntegrations: Integration[];
  loading: boolean;
  error: string | null;
  events: IntegrationEvent[];
  connectIntegration: (integrationId: string, config: Record<string, any>) => Promise<boolean>;
  disconnectIntegration: (integrationId: string) => Promise<void>;
  testConnection: (integrationId: string) => Promise<boolean>;
  triggerAction: (integrationId: string, action: string, data: any) => Promise<any>;
  refreshIntegrations: () => void;
  clearError: () => void;
}

export const useIntegrations = (): UseIntegrationsResult => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshIntegrations = useCallback(() => {
    try {
      const allIntegrations = integrationHub.getIntegrations();
      const eventHistory = integrationHub.getEventHistory();
      
      setIntegrations(allIntegrations);
      setEvents(eventHistory.slice(-50)); // Keep last 50 events
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  const connectIntegration = useCallback(async (integrationId: string, config: Record<string, any>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await integrationHub.connectIntegration(integrationId, config);
      refreshIntegrations();
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect integration';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshIntegrations]);

  const disconnectIntegration = useCallback(async (integrationId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await integrationHub.disconnectIntegration(integrationId);
      refreshIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect integration');
    } finally {
      setLoading(false);
    }
  }, [refreshIntegrations]);

  const testConnection = useCallback(async (integrationId: string): Promise<boolean> => {
    try {
      setError(null);
      return await integrationHub.testConnection(integrationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      return false;
    }
  }, []);

  const triggerAction = useCallback(async (integrationId: string, action: string, data: any): Promise<any> => {
    try {
      setError(null);
      const result = await integrationHub.triggerAction(integrationId, action, data);
      refreshIntegrations(); // Refresh to get latest events
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
      throw err;
    }
  }, [refreshIntegrations]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    refreshIntegrations();

    // Only set up event listeners on the client side
    if (typeof window !== 'undefined' && integrationHub.on) {
      // Listen for integration events
      const handleIntegrationEvent = (event: IntegrationEvent) => {
        setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
        
        // Auto-refresh integrations on connection changes
        if (event.type === 'connection_established' || event.type === 'connection_lost') {
          refreshIntegrations();
        }
      };

      integrationHub.on('integration_event', handleIntegrationEvent);

      return () => {
        if (integrationHub.off) {
          integrationHub.off('integration_event', handleIntegrationEvent);
        }
      };
    }
  }, [refreshIntegrations]);

  const connectedIntegrations = integrations.filter(integration => integration.status === 'connected');

  return {
    integrations,
    connectedIntegrations,
    loading,
    error,
    events,
    connectIntegration,
    disconnectIntegration,
    testConnection,
    triggerAction,
    refreshIntegrations,
    clearError
  };
};

export interface UseIntegrationResult {
  integration: Integration | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  connect: (config: Record<string, any>) => Promise<boolean>;
  disconnect: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  triggerAction: (action: string, data: any) => Promise<any>;
  clearError: () => void;
}

export const useIntegration = (integrationId: string): UseIntegrationResult => {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshIntegration = useCallback(() => {
    try {
      const currentIntegration = integrationHub.getIntegration(integrationId);
      setIntegration(currentIntegration || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration');
    } finally {
      setLoading(false);
    }
  }, [integrationId]);

  const connect = useCallback(async (config: Record<string, any>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await integrationHub.connectIntegration(integrationId, config);
      refreshIntegration();
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect integration';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [integrationId, refreshIntegration]);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await integrationHub.disconnectIntegration(integrationId);
      refreshIntegration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect integration');
    } finally {
      setLoading(false);
    }
  }, [integrationId, refreshIntegration]);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      return await integrationHub.testConnection(integrationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      return false;
    }
  }, [integrationId]);

  const triggerAction = useCallback(async (action: string, data: any): Promise<any> => {
    try {
      setError(null);
      return await integrationHub.triggerAction(integrationId, action, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
      throw err;
    }
  }, [integrationId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    refreshIntegration();

    // Only set up event listeners on the client side
    if (typeof window !== 'undefined' && integrationHub.on) {
      // Listen for events related to this specific integration
      const handleIntegrationEvent = (event: IntegrationEvent) => {
        if (event.integrationId === integrationId) {
          refreshIntegration();
        }
      };

      integrationHub.on('integration_event', handleIntegrationEvent);

      return () => {
        if (integrationHub.off) {
          integrationHub.off('integration_event', handleIntegrationEvent);
        }
      };
    }
  }, [integrationId, refreshIntegration]);

  const isConnected = integration?.status === 'connected';

  return {
    integration,
    loading,
    error,
    isConnected,
    connect,
    disconnect,
    testConnection,
    triggerAction,
    clearError
  };
};

export interface UseWebhooksResult {
  webhookEvents: any[];
  loading: boolean;
  error: string | null;
  testWebhook: (integrationId: string, testData: any) => Promise<any>;
  getWebhookUrl: (integrationId: string) => string;
  clearError: () => void;
}

export const useWebhooks = (): UseWebhooksResult => {
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWebhooks = useCallback(() => {
    try {
      const events = integrationHub.getWebhookEvents();
      setWebhookEvents(events.slice(-50)); // Keep last 50 events
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load webhook events');
    } finally {
      setLoading(false);
    }
  }, []);

  const testWebhook = useCallback(async (integrationId: string, testData: any): Promise<any> => {
    try {
      setError(null);
      return await webhookService.testWebhook(integrationId, testData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Webhook test failed');
      throw err;
    }
  }, []);

  const getWebhookUrl = useCallback((integrationId: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return webhookService.generateWebhookUrl(integrationId, baseUrl);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    refreshWebhooks();

    // Only set up event listeners on the client side
    if (typeof window !== 'undefined' && integrationHub.on) {
      // Listen for webhook events
      const handleIntegrationEvent = (event: IntegrationEvent) => {
        if (event.type === 'webhook_received') {
          refreshWebhooks();
        }
      };

      integrationHub.on('integration_event', handleIntegrationEvent);

      return () => {
        if (integrationHub.off) {
          integrationHub.off('integration_event', handleIntegrationEvent);
        }
      };
    }
  }, [refreshWebhooks]);

  return {
    webhookEvents,
    loading,
    error,
    testWebhook,
    getWebhookUrl,
    clearError
  };
};
