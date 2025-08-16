"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistTemplate } from '../../../types';
import { TemplateVersion, VersionChange } from '../../../types/templates';
import { templateService } from '../../../services/templates/TemplateService';
import Button from '../../UI/Button';
import Modal from '../../UI/Modal';

interface TemplateVersionManagerProps {
  template: ChecklistTemplate;
  isOpen: boolean;
  onClose: () => void;
  onVersionSelected?: (version: TemplateVersion) => void;
  userRole?: 'manager' | 'admin';
}

interface VersionState {
  versions: TemplateVersion[];
  activeVersion: TemplateVersion | undefined;
  compareVersions: TemplateVersion[];
  showComparison: boolean;
  loading: boolean;
  error: string | null;
}

const TemplateVersionManager: React.FC<TemplateVersionManagerProps> = ({
  template,
  isOpen,
  onClose,
  onVersionSelected,
  userRole = 'manager'
}) => {
  const [state, setState] = useState<VersionState>({
    versions: [],
    activeVersion: undefined,
    compareVersions: [],
    showComparison: false,
    loading: true,
    error: null
  });

  const [revertConfirm, setRevertConfirm] = useState<TemplateVersion | null>(null);

  // Load versions when modal opens
  useEffect(() => {
    if (isOpen && template) {
      loadVersions();
    }
  }, [isOpen, template]);

  const loadVersions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const versions = templateService.getTemplateVersions(template.id);
      const activeVersion = templateService.getActiveVersion(template.id);
      
      setState(prev => ({
        ...prev,
        versions: versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        activeVersion,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load template versions',
        loading: false
      }));
    }
  }, [template]);

  const handleRevertToVersion = useCallback(async (version: TemplateVersion) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const revertedTemplate = await templateService.revertToVersion(template.id, version.id);
      
      if (onVersionSelected) {
        onVersionSelected(version);
      }
      
      await loadVersions(); // Refresh versions
      setRevertConfirm(null);
      
      // TODO: Show success notification
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to revert to version',
        loading: false
      }));
    }
  }, [template, onVersionSelected, loadVersions]);

  const handleCompareVersions = useCallback((version1: TemplateVersion, version2?: TemplateVersion) => {
    if (version2) {
      setState(prev => ({
        ...prev,
        compareVersions: [version1, version2],
        showComparison: true
      }));
    } else {
      // Compare with active version
      if (state.activeVersion) {
        setState(prev => ({
          ...prev,
          compareVersions: [state.activeVersion!, version1],
          showComparison: true
        }));
      }
    }
  }, [state.activeVersion]);

  const formatVersionNumber = (version: string): string => {
    return `v${version}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionBadgeColor = (version: TemplateVersion): string => {
    if (version.isActive) return 'bg-green-100 text-green-800';
    if (version.isPublished) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getVersionBadgeText = (version: TemplateVersion): string => {
    if (version.isActive) return 'Current';
    if (version.isPublished) return 'Published';
    return 'Draft';
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Template Version History"
        className="max-w-5xl"
      >
        <div className="p-6">
          {state.loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading versions...</span>
            </div>
          ) : state.error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-400">⚠️</div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{state.error}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500">
                    {state.versions.length} version{state.versions.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setState(prev => ({ ...prev, showComparison: !prev.showComparison }))}
                    variant="secondary"
                    size="sm"
                    disabled={state.compareVersions.length < 2}
                  >
                    📊 Compare Versions
                  </Button>
                </div>
              </div>

              {/* Version Timeline */}
              <div className="space-y-4">
                {state.versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-4 ${
                      version.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {/* Version Timeline Dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            version.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          {index < state.versions.length - 1 && (
                            <div className="w-px h-8 bg-gray-200 mt-2"></div>
                          )}
                        </div>

                        {/* Version Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {formatVersionNumber(version.version)}
                            </h4>
                            
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVersionBadgeColor(version)}`}>
                              {getVersionBadgeText(version)}
                            </span>

                            {version.versionName && (
                              <span className="text-sm text-gray-600">
                                "{version.versionName}"
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mb-3">{version.description}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>👤 {version.createdBy}</span>
                            <span>📅 {formatDate(version.createdAt)}</span>
                            <span>📝 {version.template.sections.reduce((total, section) => total + section.items.length, 0)} items</span>
                          </div>

                          {/* Changelog */}
                          {version.changelog && version.changelog.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <h5 className="text-sm font-medium text-gray-700">Changes:</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {version.changelog.map((change, changeIndex) => (
                                  <li key={changeIndex} className="flex items-center space-x-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      change.type === 'added' ? 'bg-green-400' :
                                      change.type === 'modified' ? 'bg-yellow-400' :
                                      change.type === 'removed' ? 'bg-red-400' :
                                      'bg-blue-400'
                                    }`}></span>
                                    <span className="capitalize">{change.type}</span>
                                    <span>{change.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleCompareVersions(version)}
                          variant="secondary"
                          size="sm"
                          disabled={version.isActive || !state.activeVersion}
                        >
                          📊 Compare
                        </Button>

                        {userRole === 'admin' && !version.isActive && (
                          <Button
                            onClick={() => setRevertConfirm(version)}
                            variant="secondary"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                          >
                            ↩️ Revert
                          </Button>
                        )}

                        <Button
                          onClick={() => onVersionSelected?.(version)}
                          variant="secondary"
                          size="sm"
                        >
                          👁️ View
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty State */}
              {state.versions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No versions found
                  </h3>
                  <p className="text-gray-500">
                    Template versions will appear here as you make changes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Version Comparison Modal */}
      <VersionComparisonModal
        isOpen={state.showComparison}
        onClose={() => setState(prev => ({ ...prev, showComparison: false, compareVersions: [] }))}
        versions={state.compareVersions}
      />

      {/* Revert Confirmation Modal */}
      {revertConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setRevertConfirm(null)}
          title="Confirm Version Revert"
          className="max-w-md"
        >
          <div className="p-6">
            <div className="mb-4">
              <div className="text-center mb-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Revert to {formatVersionNumber(revertConfirm.version)}?
                </h3>
                <p className="text-gray-600">
                  This will create a new version based on {formatVersionNumber(revertConfirm.version)}. 
                  The current version will be preserved in the version history.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> This action will affect all users currently using this template.
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setRevertConfirm(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleRevertToVersion(revertConfirm)}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={state.loading}
              >
                {state.loading ? 'Reverting...' : 'Revert Template'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

// Version Comparison Component
interface VersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: TemplateVersion[];
}

const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  isOpen,
  onClose,
  versions
}) => {
  if (!isOpen || versions.length < 2) return null;

  const [version1, version2] = versions;

  const getSectionDifferences = () => {
    const differences: Array<{
      type: 'added' | 'removed' | 'modified' | 'unchanged';
      section: any;
      details?: string;
    }> = [];

    const sections1 = version1.template.sections;
    const sections2 = version2.template.sections;

    // Find added, removed, and modified sections
    sections2.forEach(section2 => {
      const section1 = sections1.find(s => s.id === section2.id);
      if (!section1) {
        differences.push({ type: 'added', section: section2 });
      } else if (JSON.stringify(section1) !== JSON.stringify(section2)) {
        differences.push({ 
          type: 'modified', 
          section: section2,
          details: getItemChanges(section1.items, section2.items)
        });
      } else {
        differences.push({ type: 'unchanged', section: section2 });
      }
    });

    sections1.forEach(section1 => {
      const section2 = sections2.find(s => s.id === section1.id);
      if (!section2) {
        differences.push({ type: 'removed', section: section1 });
      }
    });

    return differences;
  };

  const getItemChanges = (items1: any[], items2: any[]): string => {
    const added = items2.filter(item2 => !items1.find(item1 => item1.id === item2.id));
    const removed = items1.filter(item1 => !items2.find(item2 => item2.id === item1.id));
    
    const changes = [];
    if (added.length > 0) changes.push(`+${added.length} items`);
    if (removed.length > 0) changes.push(`-${removed.length} items`);
    
    return changes.join(', ') || 'Modified content';
  };

  const getDiffIcon = (type: string) => {
    switch (type) {
      case 'added': return '✅';
      case 'removed': return '❌';
      case 'modified': return '📝';
      default: return '⚪';
    }
  };

  const getDiffColor = (type: string) => {
    switch (type) {
      case 'added': return 'text-green-600 bg-green-50';
      case 'removed': return 'text-red-600 bg-red-50';
      case 'modified': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Version Comparison"
      className="max-w-6xl"
    >
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Version Headers */}
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              v{version1.version}
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(version1.createdAt).toLocaleDateString()}
            </p>
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-2">
              {version1.isActive ? 'Current' : 'Previous'}
            </span>
          </div>

          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              v{version2.version}
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(version2.createdAt).toLocaleDateString()}
            </p>
            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-2">
              {version2.isActive ? 'Current' : 'Comparing'}
            </span>
          </div>
        </div>

        {/* Differences */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Changes</h4>
          
          <div className="space-y-3">
            {getSectionDifferences().map((diff, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getDiffColor(diff.type)}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getDiffIcon(diff.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium">
                      {diff.section.title}
                    </div>
                    {diff.details && (
                      <div className="text-sm opacity-75 mt-1">
                        {diff.details}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium capitalize">
                    {diff.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {getSectionDifferences().filter(d => d.type !== 'unchanged').length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-600">No differences found between these versions</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TemplateVersionManager;
