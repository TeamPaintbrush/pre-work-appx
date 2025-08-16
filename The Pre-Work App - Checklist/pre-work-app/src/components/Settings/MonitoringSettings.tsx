"use client";

import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';

interface SystemMetric {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'stable';
}

interface MonitoringSettingsProps {
  className?: string;
}

const MonitoringSettings: React.FC<MonitoringSettingsProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  useEffect(() => {
    // Simulate real-time metrics
    const updateMetrics = () => {
      const newMetrics: SystemMetric[] = [
        {
          label: 'Response Time',
          value: `${(80 + Math.random() * 40).toFixed(0)}ms`,
          status: Math.random() > 0.8 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        {
          label: 'Memory Usage',
          value: `${(60 + Math.random() * 20).toFixed(1)}%`,
          status: Math.random() > 0.9 ? 'warning' : 'good',
          trend: 'stable'
        },
        {
          label: 'Active Users',
          value: `${Math.floor(150 + Math.random() * 50)}`,
          status: 'good',
          trend: 'up'
        },
        {
          label: 'Error Rate',
          value: `${(Math.random() * 0.1).toFixed(3)}%`,
          status: Math.random() > 0.95 ? 'error' : 'good',
          trend: 'down'
        }
      ];
      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = isRealTimeEnabled ? setInterval(updateMetrics, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTimeEnabled]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Health */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRealTimeEnabled}
                onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Real-time updates</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{metric.label}</span>
                <span className="text-lg">{getTrendIcon(metric.trend)}</span>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Alerts</h4>
              <p className="text-sm text-gray-600">Receive notifications for system issues</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Time Threshold (ms)
              </label>
              <input
                type="number"
                defaultValue={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memory Usage Threshold (%)
              </label>
              <input
                type="number"
                defaultValue={80}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error Rate Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue={1.0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Interval (seconds)
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">System Health Check Passed</p>
              <p className="text-xs text-green-700">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Deployment Completed</p>
              <p className="text-xs text-blue-700">1 hour ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">High Memory Usage Detected</p>
              <p className="text-xs text-yellow-700">3 hours ago</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm">
            View All Events
          </Button>
        </div>
      </div>

      {/* Monitoring Tools */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Tools</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-12">
            📈 Performance Dashboard
          </Button>
          <Button variant="outline" className="h-12">
            📋 Export Logs
          </Button>
          <Button variant="outline" className="h-12">
            🔧 Configure Webhooks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonitoringSettings;
