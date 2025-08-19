import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SyncStatus } from '../../services/aws/TemplateRealTimeSyncService';

/**
 * REAL-TIME SYNC STATUS INDICATOR
 * Visual indicator for template synchronization status
 * Shows connection state, pending changes, and sync progress
 */

export interface TemplateSyncStatusProps {
  syncStatus: SyncStatus;
  pendingChangesCount: number;
  onTriggerSync?: () => void;
  onResolveConflicts?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const TemplateSyncStatus: React.FC<TemplateSyncStatusProps> = ({
  syncStatus,
  pendingChangesCount,
  onTriggerSync,
  onResolveConflicts,
  className = '',
  showDetails = false
}) => {
  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500';
    if (syncStatus.syncInProgress) return 'text-blue-500';
    if (syncStatus.conflictCount > 0) return 'text-yellow-500';
    if (pendingChangesCount > 0) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '🔴';
    if (syncStatus.syncInProgress) return '🔄';
    if (syncStatus.conflictCount > 0) return '⚠️';
    if (pendingChangesCount > 0) return '⏳';
    return '✅';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (syncStatus.conflictCount > 0) return `${syncStatus.conflictCount} conflicts`;
    if (pendingChangesCount > 0) return `${pendingChangesCount} pending`;
    return 'Synced';
  };

  const formatLastSync = () => {
    if (!syncStatus.lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - syncStatus.lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`template-sync-status ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Status Icon with Animation */}
        <motion.div
          animate={syncStatus.syncInProgress ? { rotate: 360 } : {}}
          transition={syncStatus.syncInProgress ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          className="flex items-center"
        >
          <span className="text-lg">{getStatusIcon()}</span>
        </motion.div>

        {/* Status Text */}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {/* Manual Sync Button */}
          {onTriggerSync && !syncStatus.syncInProgress && (
            <button
              onClick={onTriggerSync}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Trigger manual sync"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Resolve Conflicts Button */}
          {onResolveConflicts && syncStatus.conflictCount > 0 && (
            <button
              onClick={onResolveConflicts}
              className="p-1 text-yellow-500 hover:text-yellow-600 transition-colors"
              title="Resolve conflicts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Detailed Status (Expandable) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 p-3 bg-gray-50 rounded-lg border"
          >
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className={syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Last Sync:</span>
                <span>{formatLastSync()}</span>
              </div>
              
              {pendingChangesCount > 0 && (
                <div className="flex justify-between">
                  <span>Pending Changes:</span>
                  <span className="text-orange-600">{pendingChangesCount}</span>
                </div>
              )}
              
              {syncStatus.conflictCount > 0 && (
                <div className="flex justify-between">
                  <span>Conflicts:</span>
                  <span className="text-yellow-600">{syncStatus.conflictCount}</span>
                </div>
              )}
              
              {syncStatus.syncInProgress && (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-blue-600">Synchronizing...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * COMPACT SYNC STATUS BADGE
 * Smaller version for headers or toolbars
 */
export const TemplateSyncBadge: React.FC<{
  syncStatus: SyncStatus;
  pendingChangesCount: number;
  onClick?: () => void;
}> = ({ syncStatus, pendingChangesCount, onClick }) => {
  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-100 text-red-800';
    if (syncStatus.syncInProgress) return 'bg-blue-100 text-blue-800';
    if (syncStatus.conflictCount > 0) return 'bg-yellow-100 text-yellow-800';
    if (pendingChangesCount > 0) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.syncInProgress) return 'Syncing';
    if (syncStatus.conflictCount > 0) return 'Conflicts';
    if (pendingChangesCount > 0) return 'Pending';
    return 'Synced';
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${getStatusColor()}`}
      title="Template sync status - click for details"
    >
      <motion.div
        animate={syncStatus.syncInProgress ? { rotate: 360 } : {}}
        transition={syncStatus.syncInProgress ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        className="w-2 h-2 rounded-full bg-current mr-1.5"
      />
      {getStatusText()}
    </button>
  );
};

export default TemplateSyncStatus;
