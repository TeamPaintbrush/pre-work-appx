"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface ProductionSettingsProps {
  className?: string;
}

const ProductionSettings: React.FC<ProductionSettingsProps> = ({ className = '' }) => {
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'failed'>('idle');

  const handleDeploy = async (environment: 'staging' | 'production') => {
    setIsDeploying(true);
    setDeploymentStatus('deploying');
    setShowDeployModal(false);
    
    // Simulate deployment
    setTimeout(() => {
      setDeploymentStatus('success');
      setIsDeploying(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'deploying': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Deployment Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Production</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('success')}`}>
                Live
              </span>
            </div>
            <p className="text-sm text-gray-600">Last deployed: 2 hours ago</p>
            <p className="text-sm text-gray-600">Version: v2.1.0</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Staging</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deploymentStatus)}`}>
                {deploymentStatus === 'idle' ? 'Ready' : deploymentStatus}
              </span>
            </div>
            <p className="text-sm text-gray-600">Last deployed: 1 day ago</p>
            <p className="text-sm text-gray-600">Version: v2.1.1-beta</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button 
            variant="primary" 
            onClick={() => setShowDeployModal(true)}
            disabled={isDeploying}
          >
            {isDeploying ? 'Deploying...' : 'New Deployment'}
          </Button>
          <Button variant="outline">
            View Logs
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">120ms</div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0.01%</div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1,250</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-12">
            📊 View Analytics
          </Button>
          <Button variant="outline" className="h-12">
            🔍 Monitor Logs
          </Button>
          <Button variant="outline" className="h-12">
            ⚙️ Configure Alerts
          </Button>
        </div>
      </div>

      {/* Environment Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Variables</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">NODE_ENV</span>
            <span className="text-sm text-gray-600">production</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">NEXT_PUBLIC_APP_URL</span>
            <span className="text-sm text-gray-600">https://prework-app.vercel.app</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">DATABASE_URL</span>
            <span className="text-sm text-gray-600">••••••••••••••••</span>
          </div>
        </div>
        
        <div className="mt-4">
          <Button variant="outline" size="sm">
            Manage Environment Variables
          </Button>
        </div>
      </div>

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
            <button
              onClick={() => handleDeploy('staging')}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Deploy to Staging</div>
              <div className="text-sm text-gray-600">Safe environment for testing</div>
            </button>
            
            <button
              onClick={() => handleDeploy('production')}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium">Deploy to Production</div>
              <div className="text-sm text-gray-600">Live environment for users</div>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductionSettings;
