import React, { useState, useEffect } from 'react';
import { Integration } from '../../services/integrations/IntegrationHub';

interface IntegrationConfigModalProps {
  integration: Integration;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: Record<string, any>) => Promise<boolean>;
  loading: boolean;
}

export const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({
  integration,
  isOpen,
  onClose,
  onConnect,
  loading
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && integration) {
      // Initialize config with existing values
      setConfig(integration.config || {});
      setErrors({});
    }
  }, [isOpen, integration]);

  const handleInputChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (integration.type) {
      case 'webhook':
        if (!config.webhookUrl) {
          newErrors.webhookUrl = 'Webhook URL is required';
        } else if (!isValidUrl(config.webhookUrl)) {
          newErrors.webhookUrl = 'Please enter a valid URL';
        }
        break;
      
      case 'api-key':
        if (!config.apiKey) {
          newErrors.apiKey = 'API Key is required';
        }
        if (integration.id === 'trello' && !config.token) {
          newErrors.token = 'Trello token is required';
        }
        break;
      
      case 'oauth':
        if (!config.clientId) {
          newErrors.clientId = 'Client ID is required';
        }
        if (!config.clientSecret) {
          newErrors.clientSecret = 'Client Secret is required';
        }
        break;
      
      case 'saml':
        if (!config.entityId) {
          newErrors.entityId = 'Entity ID is required';
        }
        if (!config.ssoUrl) {
          newErrors.ssoUrl = 'SSO URL is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateConfig()) {
      return;
    }

    setSubmitting(true);
    try {
      const success = await onConnect(config);
      if (success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderConfigFields = () => {
    switch (integration.type) {
      case 'webhook':
        return (
          <>
            <div>
              <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">
                Webhook URL
              </label>
              <input
                type="url"
                id="webhookUrl"
                value={config.webhookUrl || ''}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.webhookUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://your-app.com/webhooks/endpoint"
              />
              {errors.webhookUrl && <p className="mt-1 text-sm text-red-600">{errors.webhookUrl}</p>}
            </div>
            
            <div>
              <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700">
                Webhook Secret (Optional)
              </label>
              <input
                type="password"
                id="webhookSecret"
                value={config.webhookSecret || ''}
                onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Secret for webhook validation"
              />
            </div>
          </>
        );

      case 'api-key':
        return (
          <>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={config.apiKey || ''}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.apiKey ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your API key"
              />
              {errors.apiKey && <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>}
            </div>

            {integration.id === 'trello' && (
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Trello Token
                </label>
                <input
                  type="password"
                  id="token"
                  value={config.token || ''}
                  onChange={(e) => handleInputChange('token', e.target.value)}
                  className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.token ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Your Trello token"
                />
                {errors.token && <p className="mt-1 text-sm text-red-600">{errors.token}</p>}
              </div>
            )}

            {integration.id === 'email' && (
              <>
                <div>
                  <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    id="smtpHost"
                    value={config.smtpHost || ''}
                    onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    id="smtpPort"
                    value={config.smtpPort || ''}
                    onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="587"
                  />
                </div>
              </>
            )}
          </>
        );

      case 'oauth':
        return (
          <>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                Client ID
              </label>
              <input
                type="text"
                id="clientId"
                value={config.clientId || ''}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.clientId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your OAuth Client ID"
              />
              {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
            </div>

            <div>
              <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700">
                Client Secret
              </label>
              <input
                type="password"
                id="clientSecret"
                value={config.clientSecret || ''}
                onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.clientSecret ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your OAuth Client Secret"
              />
              {errors.clientSecret && <p className="mt-1 text-sm text-red-600">{errors.clientSecret}</p>}
            </div>

            {(integration.id === 'google-drive' || integration.id === 'teams') && (
              <div>
                <label htmlFor="redirectUri" className="block text-sm font-medium text-gray-700">
                  Redirect URI
                </label>
                <input
                  type="url"
                  id="redirectUri"
                  value={config.redirectUri || `${window.location.origin}/api/auth/${integration.id}/callback`}
                  onChange={(e) => handleInputChange('redirectUri', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="OAuth redirect URI"
                />
              </div>
            )}
          </>
        );

      case 'saml':
        return (
          <>
            <div>
              <label htmlFor="entityId" className="block text-sm font-medium text-gray-700">
                Entity ID
              </label>
              <input
                type="text"
                id="entityId"
                value={config.entityId || ''}
                onChange={(e) => handleInputChange('entityId', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.entityId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="SAML Entity ID"
              />
              {errors.entityId && <p className="mt-1 text-sm text-red-600">{errors.entityId}</p>}
            </div>

            <div>
              <label htmlFor="ssoUrl" className="block text-sm font-medium text-gray-700">
                SSO URL
              </label>
              <input
                type="url"
                id="ssoUrl"
                value={config.ssoUrl || ''}
                onChange={(e) => handleInputChange('ssoUrl', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.ssoUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="SAML SSO URL"
              />
              {errors.ssoUrl && <p className="mt-1 text-sm text-red-600">{errors.ssoUrl}</p>}
            </div>

            <div>
              <label htmlFor="certificate" className="block text-sm font-medium text-gray-700">
                Certificate (Optional)
              </label>
              <textarea
                id="certificate"
                value={config.certificate || ''}
                onChange={(e) => handleInputChange('certificate', e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              />
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-gray-500">No configuration required for this integration type.</p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm mr-3">
                {integration.icon || '🔗'}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Configure {integration.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {integration.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderConfigFields()}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  integration.status === 'connected' ? 'Update' : 'Connect'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConfigModal;
