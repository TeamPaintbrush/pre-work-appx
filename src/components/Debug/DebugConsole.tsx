/**
 * Debug Console Monitor Component
 * Real-time monitoring of console activity, errors, performance, and system health
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsoleEntry {
  id: string;
  timestamp: Date;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  stack?: string;
  count: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface SystemHealth {
  memoryUsage: number;
  renderCount: number;
  errorCount: number;
  warningCount: number;
  lastUpdate: Date;
}

interface DebugConsoleProps {
  maxEntries?: number;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const DebugConsole: React.FC<DebugConsoleProps> = ({
  maxEntries = 100,
  autoScroll = true,
  showTimestamps = true,
  enablePerformanceMonitoring = true,
  enableNetworkMonitoring = true,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    memoryUsage: 0,
    renderCount: 0,
    errorCount: 0,
    warningCount: 0,
    lastUpdate: new Date()
  });
  const [activeTab, setActiveTab] = useState<'console' | 'performance' | 'network' | 'health'>('console');
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log'>('all');
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const entryCountRef = useRef<Map<string, number>>(new Map());
  const renderCountRef = useRef(0);
  const originalConsoleRef = useRef<any>({});

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4'
  };

  // Capture console methods
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store original console methods
    originalConsoleRef.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };

    const createConsoleInterceptor = (type: 'log' | 'warn' | 'error' | 'info' | 'debug') => {
      return (...args: any[]) => {
        // Call original method
        originalConsoleRef.current[type](...args);

        // Capture for our debug console
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const entryKey = `${type}-${message}`;
        const existingCount = entryCountRef.current.get(entryKey) || 0;
        entryCountRef.current.set(entryKey, existingCount + 1);

        const entry: ConsoleEntry = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          type,
          message,
          stack: type === 'error' && args[0]?.stack ? args[0].stack : undefined,
          count: existingCount + 1
        };

        setConsoleEntries(prev => {
          const newEntries = [entry, ...prev].slice(0, maxEntries);
          return newEntries;
        });

        // Update system health
        setSystemHealth(prev => ({
          ...prev,
          errorCount: type === 'error' ? prev.errorCount + 1 : prev.errorCount,
          warningCount: type === 'warn' ? prev.warningCount + 1 : prev.warningCount,
          lastUpdate: new Date()
        }));
      };
    };

    // Override console methods
    console.log = createConsoleInterceptor('log');
    console.warn = createConsoleInterceptor('warn');
    console.error = createConsoleInterceptor('error');
    console.info = createConsoleInterceptor('info');
    console.debug = createConsoleInterceptor('debug');

    // Cleanup on unmount
    return () => {
      console.log = originalConsoleRef.current.log;
      console.warn = originalConsoleRef.current.warn;
      console.error = originalConsoleRef.current.error;
      console.info = originalConsoleRef.current.info;
      console.debug = originalConsoleRef.current.debug;
    };
  }, [maxEntries]);

  // Monitor performance (OPTIMIZED: Reduced update frequency)
  useEffect(() => {
    if (!enablePerformanceMonitoring || typeof window === 'undefined') return;

    const updatePerformanceMetrics = () => {
      const metrics: PerformanceMetric[] = [];

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.push({
          name: 'Heap Used',
          value: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          unit: 'MB',
          status: memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8 ? 'critical' : 
                 memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.6 ? 'warning' : 'good'
        });
      }

      // Simplified performance metrics without FPS (which was causing issues)
      metrics.push({
        name: 'Render Count',
        value: renderCountRef.current,
        unit: '',
        status: renderCountRef.current > 100 ? 'warning' : 'good'
      });

      setPerformanceMetrics(metrics);
    };

    // Reduced frequency to prevent performance issues
    const interval = setInterval(updatePerformanceMetrics, 5000);
    updatePerformanceMetrics();

    return () => clearInterval(interval);
  }, [enablePerformanceMonitoring]);

  // Monitor render count (FIXED: Added proper dependency to prevent infinite loop)
  useEffect(() => {
    renderCountRef.current++;
    setSystemHealth(prev => ({
      ...prev,
      renderCount: renderCountRef.current
    }));
  }, []); // Fixed: Added empty dependency array to run only once

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = 0;
    }
  }, [consoleEntries, autoScroll]);

  // Filter entries
  const filteredEntries = consoleEntries.filter(entry => 
    filter === 'all' || entry.type === filter
  );

  // Clear console
  const clearConsole = useCallback(() => {
    setConsoleEntries([]);
    entryCountRef.current.clear();
    setSystemHealth(prev => ({
      ...prev,
      errorCount: 0,
      warningCount: 0
    }));
  }, []);

  // Export logs
  const exportLogs = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      systemHealth,
      performanceMetrics,
      consoleEntries: consoleEntries.slice(0, 50), // Last 50 entries
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-log-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [consoleEntries, systemHealth, performanceMetrics]);

  // Type color mapping
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-orange-600 bg-orange-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Status indicator
  const getHealthStatus = () => {
    if (systemHealth.errorCount > 10) return { color: 'bg-red-500', text: 'Critical' };
    if (systemHealth.errorCount > 5 || systemHealth.warningCount > 20) return { color: 'bg-orange-500', text: 'Warning' };
    return { color: 'bg-green-500', text: 'Healthy' };
  };

  const healthStatus = getHealthStatus();

  if (!isOpen) {
    return (
      <motion.div
        className={`fixed ${positionClasses[position]} z-50`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${healthStatus.color}`} />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2-2V3a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2v2a2 2 0 00-2 2v6a2 2 0 002 2v2a2 2 0 00-2 2v2a2 2 0 00-2-2h-2a2 2 0 00-2-2v-2a2 2 0 00-2-2H9v2a2 2 0 002 2v2z" />
            </svg>
          </div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-50 bg-white border border-gray-300 rounded-lg shadow-2xl`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isMinimized ? 0.8 : 1, 
        opacity: 1,
        width: isMinimized ? '300px' : '600px',
        height: isMinimized ? '200px' : '500px'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${healthStatus.color}`} />
          <h3 className="font-semibold text-gray-900">Debug Console</h3>
          <span className="text-xs text-gray-500">({healthStatus.text})</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'console', label: 'Console', count: consoleEntries.length },
              { id: 'performance', label: 'Performance', count: performanceMetrics.length },
              { id: 'health', label: 'System', count: systemHealth.errorCount + systemHealth.warningCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'console' && (
              <div className="h-full flex flex-col">
                {/* Console controls */}
                <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">All ({consoleEntries.length})</option>
                      <option value="error">Errors ({consoleEntries.filter(e => e.type === 'error').length})</option>
                      <option value="warn">Warnings ({consoleEntries.filter(e => e.type === 'warn').length})</option>
                      <option value="info">Info ({consoleEntries.filter(e => e.type === 'info').length})</option>
                      <option value="log">Logs ({consoleEntries.filter(e => e.type === 'log').length})</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={clearConsole}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Clear
                    </button>
                    <button
                      onClick={exportLogs}
                      className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      Export
                    </button>
                  </div>
                </div>

                {/* Console entries */}
                <div
                  ref={consoleRef}
                  className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs"
                >
                  {filteredEntries.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded border-l-4 ${getTypeColor(entry.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {showTimestamps && (
                            <span className="text-gray-500 mr-2">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          )}
                          <span className="font-medium uppercase mr-2">
                            {entry.type}
                          </span>
                          {entry.count > 1 && (
                            <span className="bg-gray-600 text-white px-1 rounded text-xs mr-2">
                              {entry.count}
                            </span>
                          )}
                          <pre className="whitespace-pre-wrap break-words">
                            {entry.message}
                          </pre>
                          {entry.stack && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-gray-600">Stack trace</summary>
                              <pre className="mt-1 text-xs text-gray-500 whitespace-pre-wrap">
                                {entry.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredEntries.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No console entries
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Performance Metrics</h4>
                <div className="space-y-2">
                  {performanceMetrics.map(metric => (
                    <div key={metric.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{metric.value} {metric.unit}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="p-4 space-y-4">
                <h4 className="font-medium text-gray-900">System Health</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500">Render Count</div>
                    <div className="text-lg font-bold">{systemHealth.renderCount}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-xs text-red-600">Errors</div>
                    <div className="text-lg font-bold text-red-600">{systemHealth.errorCount}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="text-xs text-orange-600">Warnings</div>
                    <div className="text-lg font-bold text-orange-600">{systemHealth.warningCount}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-xs text-blue-600">Last Update</div>
                    <div className="text-sm font-medium text-blue-600">
                      {systemHealth.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DebugConsole;
