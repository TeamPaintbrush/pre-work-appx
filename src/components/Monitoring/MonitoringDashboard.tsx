"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../UI/Button';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: string;
  services: {
    api: 'online' | 'offline' | 'degraded';
    database: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
    cache: 'online' | 'offline' | 'degraded';
  };
}

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  requestsPerSecond: number;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  userAgent?: string;
  userId?: string;
  stackTrace?: string;
}

interface MonitoringDashboardProps {
  className?: string;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ className = '' }) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const updateSystemHealth = () => {
      const health: SystemHealth = {
        status: Math.random() > 0.1 ? 'healthy' : 'warning',
        uptime: 99.95 + Math.random() * 0.04,
        lastCheck: new Date().toISOString(),
        services: {
          api: Math.random() > 0.05 ? 'online' : 'degraded',
          database: Math.random() > 0.02 ? 'online' : 'degraded',
          storage: Math.random() > 0.01 ? 'online' : 'degraded',
          cache: Math.random() > 0.03 ? 'online' : 'degraded',
        },
      };
      setSystemHealth(health);
    };

    const updatePerformanceMetrics = () => {
      const newMetric: PerformanceMetric = {
        timestamp: new Date().toISOString(),
        responseTime: 80 + Math.random() * 40,
        memoryUsage: 60 + Math.random() * 20,
        cpuUsage: 30 + Math.random() * 30,
        activeUsers: 150 + Math.floor(Math.random() * 50),
        requestsPerSecond: 50 + Math.floor(Math.random() * 20),
      };
      
      setPerformanceMetrics(prev => {
        const updated = [newMetric, ...prev].slice(0, 50);
        return updated;
      });
    };

    // Initial load
    updateSystemHealth();
    updatePerformanceMetrics();

    // Set up intervals
    const healthInterval = setInterval(updateSystemHealth, 30000); // 30 seconds
    const metricsInterval = setInterval(updatePerformanceMetrics, 5000); // 5 seconds

    // Mock error logs
    const mockErrors: ErrorLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        source: 'api/checklists',
        stackTrace: 'Error: Connection timeout\n  at Database.connect',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'warning',
        message: 'High memory usage detected',
        source: 'system',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'info',
        message: 'Deployment completed successfully',
        source: 'deployment',
      },
    ];
    setErrorLogs(mockErrors);

    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handleExportLogs = useCallback(() => {
    const logData = errorLogs.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      source: log.source,
    }));
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [errorLogs]);

  const renderHealthIndicator = (service: string, status: string) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="font-medium text-gray-900 capitalize">{service}</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    </div>
  );

  const renderMetricChart = (metrics: PerformanceMetric[], key: keyof PerformanceMetric, label: string, unit: string) => {
    const values = metrics.slice(0, 20).reverse().map(m => Number(m[key]));
    const max = Math.max(...values) * 1.1;
    const min = Math.min(...values) * 0.9;
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">{label}</h4>
        <div className="h-24 flex items-end space-x-1">
          {values.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-500 rounded-t"
              style={{
                height: `${((value - min) / (max - min)) * 100}%`,
                minHeight: '2px',
              }}
              title={`${value.toFixed(1)}${unit}`}
            />
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Current: {values[values.length - 1]?.toFixed(1)}{unit}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>
          <p className="text-gray-600 mt-1">Real-time system health and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isRealTimeEnabled}
              onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Real-time updates</span>
          </label>
          
          <Button variant="outline" size="sm" onClick={handleExportLogs}>
            Export Logs
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemHealth.status)}`}>
                {systemHealth.status}
              </span>
              <span className="text-sm text-gray-600">
                Uptime: {systemHealth.uptime.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemHealth.services).map(([service, status]) =>
              renderHealthIndicator(service, status)
            )}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderMetricChart(performanceMetrics, 'responseTime', 'Response Time', 'ms')}
          {renderMetricChart(performanceMetrics, 'memoryUsage', 'Memory Usage', '%')}
          {renderMetricChart(performanceMetrics, 'cpuUsage', 'CPU Usage', '%')}
          {renderMetricChart(performanceMetrics, 'activeUsers', 'Active Users', '')}
          {renderMetricChart(performanceMetrics, 'requestsPerSecond', 'Requests/sec', '')}
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable alerts</span>
          </label>
        </div>
        
        <div className="space-y-3">
          {errorLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded-lg ${getLogLevelColor(log.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.source}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{log.message}</p>
                  {log.stackTrace && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                        {log.stackTrace}
                      </pre>
                    </details>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Alert Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Uptime Threshold (%)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue={99.9}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button variant="primary">
            Save Alert Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
