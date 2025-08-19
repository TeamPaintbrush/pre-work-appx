// Real-time Sync Component
// Bidirectional data synchronization with live monitoring

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';
import { 
  RealTimeSync, 
  SyncMetrics, 
  SyncError,
  IntegrationConnection 
} from '../../types/integrations';
import { integrationEcosystemService } from '../../services/integrations/IntegrationEcosystemService';
import {
  RefreshCw,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  XCircle,
  Info
} from 'lucide-react';

interface RealTimeSyncProps {
  workspaceId: string;
  connections: IntegrationConnection[];
  className?: string;
}

export const RealTimeSyncComponent: React.FC<RealTimeSyncProps> = ({
  workspaceId,
  connections,
  className = ''
}) => {
  const [syncs, setSyncs] = useState<RealTimeSync[]>([]);
  const [selectedSync, setSelectedSync] = useState<RealTimeSync | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState(true);

  useEffect(() => {
    loadSyncs();
  }, [workspaceId]);

  useEffect(() => {
    if (!liveUpdates) return;

    const interval = setInterval(() => {
      loadSyncs();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [liveUpdates, workspaceId]);

  const loadSyncs = async () => {
    setIsLoading(true);
    try {
      const syncList = await integrationEcosystemService.getRealTimeSyncs(workspaceId);
      setSyncs(syncList);
    } catch (error) {
      console.error('Failed to load syncs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSync = async (syncData: Partial<RealTimeSync>) => {
    try {
      const newSync = await integrationEcosystemService.createRealTimeSync({
        workspaceId,
        connectionId: syncData.connectionId || '',
        syncType: syncData.syncType || 'incremental',
        direction: syncData.direction || 'bidirectional',
        status: 'idle',
        configuration: syncData.configuration || getDefaultConfiguration(),
        metrics: getDefaultMetrics(),
        lastSync: new Date()
      });

      setSyncs(prev => [...prev, newSync]);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create sync:', error);
    }
  };

  const handleTriggerSync = async (syncId: string, syncType: 'full' | 'incremental' = 'incremental') => {
    try {
      await integrationEcosystemService.triggerSync(syncId, syncType);
      // Update UI to show sync started
      setSyncs(prev => 
        prev.map(s => s.id === syncId ? { ...s, status: 'syncing' } : s)
      );
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  };

  const getDefaultConfiguration = () => ({
    batchSize: 100,
    syncInterval: 300, // 5 minutes
    conflictResolution: 'source_wins' as const,
    fieldMappings: [],
    filters: [],
    transformations: [],
    enableRealtime: true
  });

  const getDefaultMetrics = (): SyncMetrics => ({
    totalRecords: 0,
    recordsProcessed: 0,
    recordsSuccess: 0,
    recordsError: 0,
    recordsSkipped: 0,
    bytesTransferred: 0,
    syncDuration: 0,
    throughput: 0,
    errorDetails: []
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'syncing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'paused': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'import': return <ArrowDown className="w-4 h-4" />;
      case 'export': return <ArrowUp className="w-4 h-4" />;
      case 'bidirectional': return <ArrowUpDown className="w-4 h-4" />;
      default: return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getConnection = (connectionId: string) => {
    return connections.find(c => c.id === connectionId);
  };

  if (isLoading && syncs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FeatureGate feature="realTimeSync" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <RefreshCw className="w-6 h-6 mr-2 text-blue-600" />
                Real-time Sync
              </h2>
              <p className="text-gray-600 mt-1">Monitor and manage bidirectional data synchronization</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLiveUpdates(!liveUpdates)}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  liveUpdates 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <Activity className="w-4 h-4 mr-1" />
                Live Updates
              </button>
              
              <button
                onClick={loadSyncs}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Database className="w-4 h-4 mr-2" />
                Setup Sync
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {syncs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sync configurations found</h3>
              <p className="text-gray-600 mb-6">
                Set up real-time synchronization to keep your data in sync across integrations
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Database className="w-4 h-4 mr-2" />
                Setup First Sync
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {syncs.map((sync) => {
                const connection = getConnection(sync.connectionId);
                return (
                  <motion.div
                    key={sync.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getDirectionIcon(sync.direction)}
                          <h3 className="text-lg font-medium text-gray-900">
                            {connection?.providerName || 'Unknown Provider'} Sync
                          </h3>
                        </div>
                        
                        <div className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(sync.status)}`}>
                          {getStatusIcon(sync.status)}
                          <span className="capitalize">{sync.status}</span>
                        </div>
                        
                        <div className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {sync.syncType}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTriggerSync(sync.id, 'incremental')}
                          disabled={sync.status === 'syncing'}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Trigger incremental sync"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleTriggerSync(sync.id, 'full')}
                          disabled={sync.status === 'syncing'}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Trigger full sync"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setSelectedSync(sync)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Configure sync"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sync Configuration Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Direction:</span>
                        <span className="ml-1 font-medium capitalize">{sync.direction}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Interval:</span>
                        <span className="ml-1 font-medium">{sync.configuration?.syncInterval || 30}s</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Batch Size:</span>
                        <span className="ml-1 font-medium">{sync.configuration?.batchSize || 100}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Sync:</span>
                        <span className="ml-1 font-medium">
                          {sync.lastSync ? sync.lastSync.toLocaleTimeString() : 'Never'}
                        </span>
                      </div>
                    </div>

                    {/* Sync Metrics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Sync Metrics
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {sync.metrics?.totalRecords?.toLocaleString() || '0'}
                          </div>
                          <div className="text-gray-600">Total Records</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {sync.metrics?.recordsSuccess?.toLocaleString() || '0'}
                          </div>
                          <div className="text-gray-600">Success</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {sync.metrics?.recordsError?.toLocaleString() || '0'}
                          </div>
                          <div className="text-gray-600">Errors</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatBytes(sync.metrics?.bytesTransferred || 0)}
                          </div>
                          <div className="text-gray-600">Transferred</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {(sync.metrics?.throughput || 0).toFixed(1)}/s
                          </div>
                          <div className="text-gray-600">Throughput</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {sync.status === 'syncing' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>
                              {sync.metrics.recordsProcessed} / {sync.metrics.totalRecords}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(100, (sync.metrics.recordsProcessed / Math.max(1, sync.metrics.totalRecords)) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error Details */}
                    {sync.metrics.errorDetails.length > 0 && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-900 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Recent Errors ({sync.metrics.errorDetails.length})
                        </h5>
                        <div className="space-y-2">
                          {sync.metrics.errorDetails.slice(0, 3).map((error, index) => (
                            <div key={error.id} className="text-sm">
                              <div className="font-medium text-red-800">{error.errorType}</div>
                              <div className="text-red-700">{error.errorMessage}</div>
                            </div>
                          ))}
                          {sync.metrics.errorDetails.length > 3 && (
                            <div className="text-sm text-red-600">
                              +{sync.metrics.errorDetails.length - 3} more errors
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overall Statistics */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">Total Syncs:</span>
              <span className="font-medium">{syncs.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Active:</span>
              <span className="font-medium">{syncs.filter(s => s.status === 'active').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">Total Records:</span>
              <span className="font-medium">
                {syncs.reduce((sum, s) => sum + s.metrics.totalRecords, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-gray-600">Data Transferred:</span>
              <span className="font-medium">
                {formatBytes(syncs.reduce((sum, s) => sum + s.metrics.bytesTransferred, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Configuration Modal */}
      <AnimatePresence>
        {(isCreating || selectedSync) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {isCreating ? 'Setup New Sync' : 'Configure Sync'}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Connection
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg">
                        <option value="">Select connection...</option>
                        {connections.map(conn => (
                          <option key={conn.id} value={conn.id}>
                            {conn.providerName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sync Direction
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg">
                        <option value="bidirectional">Bidirectional</option>
                        <option value="import">Import Only</option>
                        <option value="export">Export Only</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sync Interval (seconds)
                      </label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        defaultValue={300}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch Size
                      </label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        defaultValue={100}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conflict Resolution
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                      <option value="source_wins">Source Wins</option>
                      <option value="destination_wins">Destination Wins</option>
                      <option value="merge">Merge</option>
                      <option value="manual">Manual Review</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="enableRealtime" 
                      className="rounded"
                      defaultChecked
                    />
                    <label htmlFor="enableRealtime" className="text-sm text-gray-700">
                      Enable real-time sync
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedSync(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (isCreating) {
                      handleCreateSync({
                        connectionId: connections[0]?.id,
                        syncType: 'incremental',
                        direction: 'bidirectional'
                      });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isCreating ? 'Create Sync' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeatureGate>
  );
};

export default RealTimeSyncComponent;
