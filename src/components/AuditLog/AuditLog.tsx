"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAriaLiveRegion, useAccessibilityPreferences } from '../../hooks/useAccessibility';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export type AuditAction = 
  | 'created'
  | 'updated' 
  | 'deleted'
  | 'completed'
  | 'uncompleted'
  | 'shared'
  | 'imported'
  | 'exported'
  | 'viewed'
  | 'duplicated'
  | 'archived'
  | 'restored'
  | 'assigned'
  | 'unassigned';

export type ResourceType = 
  | 'checklist'
  | 'template'
  | 'item'
  | 'section'
  | 'reminder'
  | 'attachment'
  | 'user'
  | 'team'
  | 'permission';

interface AuditLogProps {
  entries: AuditLogEntry[];
  currentUserId: string;
  onExportLog?: (filters: AuditLogFilters) => void;
  onClearLog?: () => void;
}

interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  searchTerm?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({
  entries,
  currentUserId,
  onExportLog,
  onClearLog
}) => {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const { announce } = useAriaLiveRegion();
  const { prefersReducedMotion } = useAccessibilityPreferences();

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Apply filters
    if (filters.startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= filters.endDate!);
    }
    if (filters.userId) {
      filtered = filtered.filter(entry => entry.userId === filters.userId);
    }
    if (filters.action) {
      filtered = filtered.filter(entry => entry.action === filters.action);
    }
    if (filters.resourceType) {
      filtered = filtered.filter(entry => entry.resourceType === filters.resourceType);
    }
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.resourceName.toLowerCase().includes(searchLower) ||
        entry.details.toLowerCase().includes(searchLower) ||
        entry.userName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [entries, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getActionIcon = (action: AuditAction): string => {
    switch (action) {
      case 'created': return '➕';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      case 'completed': return '✅';
      case 'uncompleted': return '⭕';
      case 'shared': return '🔗';
      case 'imported': return '📥';
      case 'exported': return '📤';
      case 'viewed': return '👁️';
      case 'duplicated': return '📋';
      case 'archived': return '📦';
      case 'restored': return '♻️';
      case 'assigned': return '👤';
      case 'unassigned': return '👥';
      default: return '📝';
    }
  };

  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case 'created': return 'text-green-600 bg-green-100';
      case 'updated': return 'text-blue-600 bg-blue-100';
      case 'deleted': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'uncompleted': return 'text-yellow-600 bg-yellow-100';
      case 'shared': return 'text-purple-600 bg-purple-100';
      case 'imported': return 'text-indigo-600 bg-indigo-100';
      case 'exported': return 'text-orange-600 bg-orange-100';
      case 'viewed': return 'text-gray-600 bg-gray-100';
      case 'duplicated': return 'text-cyan-600 bg-cyan-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      case 'restored': return 'text-green-600 bg-green-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'unassigned': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleExportLog = () => {
    if (onExportLog) {
      onExportLog(filters);
      announce('Audit log export initiated', 'polite');
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    announce('Filters cleared', 'polite');
  };

  const uniqueUsers = useMemo(() => {
    const users = new Map();
    entries.forEach(entry => {
      if (!users.has(entry.userId)) {
        users.set(entry.userId, entry.userName);
      }
    });
    return Array.from(users.entries()).map(([id, name]) => ({ id, name }));
  }, [entries]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Log</h1>
            <p className="text-gray-600">
              Track all activities and changes in your checklists and templates
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
              }
            >
              Filter
            </Button>
            {onExportLog && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLog}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {key}: {value.toString()}
                </span>
              );
            })}
            <Button
              variant="outline"
              size="xs"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{uniqueUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Events</p>
              <p className="text-2xl font-semibold text-gray-900">
                {entries.filter(entry => {
                  const today = new Date();
                  const entryDate = new Date(entry.timestamp);
                  return entryDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M7 8L5.5 6.5A1 1 0 004 7v1m3 0l1.5-1.5A1 1 0 0010 7v1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Most Active User</p>
              <p className="text-sm font-semibold text-gray-900">
                {(() => {
                  const userCounts = new Map();
                  entries.forEach(entry => {
                    userCounts.set(entry.userId, (userCounts.get(entry.userId) || 0) + 1);
                  });
                  const mostActive = Array.from(userCounts.entries())
                    .sort((a, b) => b[1] - a[1])[0];
                  if (!mostActive) return 'None';
                  const user = uniqueUsers.find(u => u.id === mostActive[0]);
                  return user ? user.name : 'Unknown';
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {paginatedEntries.length} of {filteredEntries.length} entries
          </p>
        </div>

        {paginatedEntries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit entries found</h3>
            <p className="text-gray-600">
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'Activity will appear here as users interact with the system.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActionColor(entry.action)}`}>
                      {getActionIcon(entry.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.userName}
                        </p>
                        <span className="text-sm text-gray-500">
                          {entry.action}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {entry.resourceType}
                        </span>
                        <span className="text-sm text-gray-600 truncate">
                          "{entry.resourceName}"
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {entry.details}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(entry.timestamp)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <AuditLogFilterModal
          filters={filters}
          users={uniqueUsers}
          onApplyFilters={(newFilters) => {
            setFilters(newFilters);
            setIsFilterModalOpen(false);
            announce('Filters applied', 'polite');
          }}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <AuditLogEntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};

// Filter Modal Component
interface AuditLogFilterModalProps {
  filters: AuditLogFilters;
  users: { id: string; name: string }[];
  onApplyFilters: (filters: AuditLogFilters) => void;
  onClose: () => void;
}

const AuditLogFilterModal: React.FC<AuditLogFilterModalProps> = ({
  filters,
  users,
  onApplyFilters,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  const actions: AuditAction[] = [
    'created', 'updated', 'deleted', 'completed', 'uncompleted',
    'shared', 'imported', 'exported', 'viewed', 'duplicated',
    'archived', 'restored', 'assigned', 'unassigned'
  ];

  const resourceTypes: ResourceType[] = [
    'checklist', 'template', 'item', 'section', 'reminder',
    'attachment', 'user', 'team', 'permission'
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="Filter Audit Log" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={localFilters.startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                startDate: e.target.value ? new Date(e.target.value) : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={localFilters.endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                endDate: e.target.value ? new Date(e.target.value) : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User Filter */}
        <div>
          <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-2">
            User
          </label>
          <select
            id="user-filter"
            value={localFilters.userId || ''}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              userId: e.target.value || undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div>
          <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Action
          </label>
          <select
            id="action-filter"
            value={localFilters.action || ''}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              action: (e.target.value as AuditAction) || undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type Filter */}
        <div>
          <label htmlFor="resource-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Resource Type
          </label>
          <select
            id="resource-filter"
            value={localFilters.resourceType || ''}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              resourceType: (e.target.value as ResourceType) || undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Resource Types</option>
            {resourceTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Search Term */}
        <div>
          <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">
            Search Term
          </label>
          <input
            type="text"
            id="search-term"
            value={localFilters.searchTerm || ''}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              searchTerm: e.target.value || undefined
            })}
            placeholder="Search in resource names, details, or user names..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocalFilters({})}
            type="button"
          >
            Clear All
          </Button>
          <Button variant="primary" type="submit">
            Apply Filters
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Entry Detail Modal Component
interface AuditLogEntryModalProps {
  entry: AuditLogEntry;
  onClose: () => void;
}

const AuditLogEntryModal: React.FC<AuditLogEntryModalProps> = ({
  entry,
  onClose
}) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Audit Log Entry Details" size="lg">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
            <p className="text-sm text-gray-900">{entry.timestamp.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <p className="text-sm text-gray-900">{entry.userName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <p className="text-sm text-gray-900 capitalize">{entry.action}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <p className="text-sm text-gray-900 capitalize">{entry.resourceType}</p>
          </div>
        </div>

        {/* Resource Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
          <p className="text-sm text-gray-900">{entry.resourceName}</p>
          <p className="text-xs text-gray-500 mt-1">ID: {entry.resourceId}</p>
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <p className="text-sm text-gray-900">{entry.details}</p>
        </div>

        {/* Changes */}
        {entry.changes && entry.changes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Changes</label>
            <div className="space-y-2">
              {entry.changes.map((change, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {change.field}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">From:</span>
                      <p className="text-sm text-gray-700 bg-red-50 p-2 rounded mt-1">
                        {change.oldValue || '(empty)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">To:</span>
                      <p className="text-sm text-gray-700 bg-green-50 p-2 rounded mt-1">
                        {change.newValue || '(empty)'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details */}
        {(entry.ipAddress || entry.userAgent || entry.sessionId) && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Technical Details</label>
            <div className="space-y-2 text-sm">
              {entry.ipAddress && (
                <div>
                  <span className="text-gray-500">IP Address:</span>
                  <span className="ml-2 text-gray-900">{entry.ipAddress}</span>
                </div>
              )}
              {entry.sessionId && (
                <div>
                  <span className="text-gray-500">Session ID:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">{entry.sessionId}</span>
                </div>
              )}
              {entry.userAgent && (
                <div>
                  <span className="text-gray-500">User Agent:</span>
                  <p className="text-gray-900 text-xs mt-1 break-all">{entry.userAgent}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Additional Metadata</label>
            <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(entry.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditLog;
