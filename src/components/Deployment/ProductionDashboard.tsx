"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface DeploymentStatus {
  environment: 'development' | 'staging' | 'production';
  status: 'deploying' | 'success' | 'failed' | 'idle';
  version: string;
  timestamp: string;
  url?: string;
  commit?: string;
  duration?: number;
  logs?: string[];
}

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    ttfb: number; // Time to First Byte
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  serverMetrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
}

interface MonitoringAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  environment: string;
}

interface ProductionDashboardProps {
  className?: string;
}

const ProductionDashboard: React.FC<ProductionDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'deployment' | 'monitoring' | 'performance' | 'settings'>('deployment');
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<'staging' | 'production'>('staging');
  const [deploymentConfig, setDeploymentConfig] = useState({
    enableMonitoring: true,
    enableAlerts: true,
    enablePerformanceTracking: true,
    enableErrorReporting: true,
    enableAnalytics: true,
    autoScale: true,
    backupEnabled: true,
  });

  // Simulate fetching deployment data
  useEffect(() => {
    const mockDeployments: DeploymentStatus[] = [
      {
        environment: 'production',
        status: 'success',
        version: 'v2.1.0',
        timestamp: '2025-08-16T10:30:00Z',
        url: 'https://prework-app.vercel.app',
        commit: 'a1b2c3d',
        duration: 180,
      },
      {
        environment: 'staging',
        status: 'success',
        version: 'v2.1.1-beta',
        timestamp: '2025-08-16T12:15:00Z',
        url: 'https://staging-prework-app.vercel.app',
        commit: 'e4f5g6h',
        duration: 145,
      },
    ];

    const mockPerformance: PerformanceMetrics = {
      coreWebVitals: {
        lcp: 1.2,
        fid: 50,
        cls: 0.05,
        ttfb: 200,
      },
      lighthouse: {
        performance: 95,
        accessibility: 98,
        bestPractices: 92,
        seo: 96,
      },
      serverMetrics: {
        responseTime: 120,
        throughput: 1500,
        errorRate: 0.01,
        uptime: 99.95,
      },
    };

    const mockAlerts: MonitoringAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Response Time',
        message: 'Average response time exceeded 200ms threshold',
        timestamp: '2025-08-16T11:45:00Z',
        resolved: false,
        environment: 'production',
      },
      {
        id: '2',
        type: 'info',
        title: 'Deployment Successful',
        message: 'Successfully deployed v2.1.0 to production',
        timestamp: '2025-08-16T10:30:00Z',
        resolved: true,
        environment: 'production',
      },
    ];

    setDeployments(mockDeployments);
    setPerformance(mockPerformance);
    setAlerts(mockAlerts);
  }, []);

  const handleDeploy = useCallback(async (environment: 'staging' | 'production') => {
    setIsDeploying(true);
    setShowDeployModal(false);
    
    // Simulate deployment process
    const newDeployment: DeploymentStatus = {
      environment,
      status: 'deploying',
      version: 'v2.1.2',
      timestamp: new Date().toISOString(),
      commit: 'x1y2z3a',
    };

    setDeployments(prev => [newDeployment, ...prev]);

    // Simulate deployment completion
    setTimeout(() => {
      setDeployments(prev => 
        prev.map(d => 
          d.timestamp === newDeployment.timestamp
            ? { 
                ...d, 
                status: 'success', 
                duration: 165,
                url: environment === 'production' 
                  ? 'https://prework-app.vercel.app' 
                  : 'https://staging-prework-app.vercel.app'
              }
            : d
        )
      );
      setIsDeploying(false);
    }, 3000);
  }, []);

  const getStatusColor = (status: DeploymentStatus['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'deploying': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: MonitoringAlert['type']) => {
    switch (type) {
      case 'error': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const renderDeploymentTab = () => (
    <div className="space-y-6">
      {/* Deploy Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Deploy Application</h3>
          <Button
            variant="primary"
            onClick={() => setShowDeployModal(true)}
            disabled={isDeploying}
          >
            {isDeploying ? 'Deploying...' : 'New Deployment'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Staging Environment</h4>
            <p className="text-sm text-gray-600 mb-3">Test your changes before production</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDeploy('staging')}
              disabled={isDeploying}
            >
              Deploy to Staging
            </Button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Production Environment</h4>
            <p className="text-sm text-gray-600 mb-3">Live application for users</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDeploy('production')}
              disabled={isDeploying}
            >
              Deploy to Production
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Deployments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deployments</h3>
        <div className="space-y-3">
          {deployments.map((deployment, index) => (
            <motion.div
              key={`${deployment.environment}-${deployment.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                  {deployment.status}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{deployment.environment}</p>
                  <p className="text-sm text-gray-600">{deployment.version}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-900">
                  {new Date(deployment.timestamp).toLocaleString()}
                </p>
                {deployment.duration && (
                  <p className="text-sm text-gray-600">{deployment.duration}s</p>
                )}
              </div>
              
              {deployment.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(deployment.url, '_blank')}
                >
                  View
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      {/* Alerts Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border-l-4 rounded-lg ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {alert.environment} • {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.resolved && (
                  <Button variant="outline" size="sm">
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(deploymentConfig).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setDeploymentConfig(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {performance && (
        <>
          {/* Core Web Vitals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performance.coreWebVitals.lcp}s</div>
                <div className="text-sm text-gray-600">LCP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performance.coreWebVitals.fid}ms</div>
                <div className="text-sm text-gray-600">FID</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performance.coreWebVitals.cls}</div>
                <div className="text-sm text-gray-600">CLS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{performance.coreWebVitals.ttfb}ms</div>
                <div className="text-sm text-gray-600">TTFB</div>
              </div>
            </div>
          </div>

          {/* Lighthouse Scores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lighthouse Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(performance.lighthouse).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-bold ${value >= 90 ? 'text-green-600' : value >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {value}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Server Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{performance.serverMetrics.responseTime}ms</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performance.serverMetrics.throughput}</div>
                <div className="text-sm text-gray-600">Requests/min</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{(performance.serverMetrics.errorRate * 100).toFixed(2)}%</div>
                <div className="text-sm text-gray-600">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performance.serverMetrics.uptime}%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment Variables
            </label>
            <textarea
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="NEXT_PUBLIC_API_URL=https://api.example.com&#10;DATABASE_URL=postgresql://..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain Configuration
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="prework-app.com"
            />
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline">
              Export Configuration
            </Button>
            <Button variant="primary">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor deployments, performance, and system health</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'deployment', label: 'Deployment', icon: '🚀' },
            { id: 'monitoring', label: 'Monitoring', icon: '📊' },
            { id: 'performance', label: 'Performance', icon: '⚡' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'deployment' && renderDeploymentTab()}
          {activeTab === 'monitoring' && renderMonitoringTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </motion.div>
      </AnimatePresence>

      {/* Deploy Modal */}
      <Modal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        title="Deploy Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Choose the target environment for deployment:
          </p>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="environment"
                value="staging"
                checked={selectedEnvironment === 'staging'}
                onChange={(e) => setSelectedEnvironment(e.target.value as 'staging')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium">Staging</span>
                <p className="text-sm text-gray-600">Safe environment for testing</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="environment"
                value="production"
                checked={selectedEnvironment === 'production'}
                onChange={(e) => setSelectedEnvironment(e.target.value as 'production')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium">Production</span>
                <p className="text-sm text-gray-600">Live environment for users</p>
              </div>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeployModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleDeploy(selectedEnvironment)}
            >
              Deploy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductionDashboard;
