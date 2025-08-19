import React, { useState } from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import { Integration } from '../../services/integrations/IntegrationHub';
import IntegrationCard from './IntegrationCard';
import IntegrationConfigModal from './IntegrationConfigModal';
import IntegrationEventLog from './IntegrationEventLog';
import WebhookManager from './WebhookManager';

interface IntegrationHubProps {
  className?: string;
}

export const IntegrationHub: React.FC<IntegrationHubProps> = ({ className = '' }) => {
  const {
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
  } = useIntegrations();

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'integrations' | 'webhooks' | 'events'>('integrations');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'productivity', 'communication', 'storage', 'automation', 'analytics'];

  const filteredIntegrations = integrations.filter(integration => {
    if (categoryFilter === 'all') return true;
    return integration.category === categoryFilter;
  });

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  const handleCloseConfigModal = () => {
    setSelectedIntegration(null);
    setShowConfigModal(false);
  };

  const handleConnectIntegration = async (config: Record<string, any>) => {
    if (!selectedIntegration) return false;
    
    const success = await connectIntegration(selectedIntegration.id, config);
    if (success) {
      handleCloseConfigModal();
    }
    return success;
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    if (window.confirm('Are you sure you want to disconnect this integration?')) {
      await disconnectIntegration(integrationId);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    return await testConnection(integrationId);
  };

  const handleTriggerAction = async (integrationId: string, action: string, data: any) => {
    return await triggerAction(integrationId, action, data);
  };

  if (loading && integrations.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Hub</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect and manage third-party integrations, webhooks, and SSO providers
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button
            onClick={refreshIntegrations}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <div className="text-sm text-gray-600">
            {connectedIntegrations.length} of {integrations.length} connected
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={clearError}
                  className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'integrations', name: 'Integrations', count: integrations.length },
            { id: 'webhooks', name: 'Webhooks', count: null },
            { id: 'events', name: 'Event Log', count: events.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  categoryFilter === category
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConfigure={() => handleConfigureIntegration(integration)}
                onDisconnect={() => handleDisconnectIntegration(integration.id)}
                onTest={() => handleTestConnection(integration.id)}
                onTriggerAction={(action: string, data: any) => handleTriggerAction(integration.id, action, data)}
                loading={loading}
              />
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No integrations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {categoryFilter === 'all' 
                  ? 'No integrations are available.' 
                  : `No integrations found in the ${categoryFilter} category.`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'webhooks' && (
        <WebhookManager />
      )}

      {activeTab === 'events' && (
        <IntegrationEventLog events={events} />
      )}

      {/* Configuration Modal */}
      {selectedIntegration && (
        <IntegrationConfigModal
          integration={selectedIntegration}
          isOpen={showConfigModal}
          onClose={handleCloseConfigModal}
          onConnect={handleConnectIntegration}
          loading={loading}
        />
      )}
    </div>
  );
};

export default IntegrationHub;
