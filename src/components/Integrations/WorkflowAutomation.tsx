// Workflow Automation Component
// Visual workflow builder with trigger-based automations

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';
import { 
  WorkflowAutomation as WorkflowAutomationType, 
  WorkflowTrigger, 
  WorkflowAction, 
  WorkflowCondition 
} from '../../types/integrations';
import { integrationEcosystemService } from '../../services/integrations/IntegrationEcosystemService';
import {
  Play,
  Pause,
  Plus,
  Settings,
  Trash2,
  Zap,
  Clock,
  Mail,
  Webhook,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  Filter,
  ArrowRight,
  Edit3
} from 'lucide-react';

interface WorkflowAutomationProps {
  workspaceId: string;
  userId: string;
  className?: string;
}

export const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
  workspaceId,
  userId,
  className = ''
}) => {
  const [workflows, setWorkflows] = useState<WorkflowAutomationType[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowAutomationType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadWorkflows();
    }
  }, [workspaceId, mounted]);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const workflowList = await integrationEcosystemService.getWorkflows(workspaceId);
      setWorkflows(workflowList);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async (workflowData: Partial<WorkflowAutomationType>) => {
    try {
      const newWorkflow = await integrationEcosystemService.createWorkflow({
        workspaceId,
        name: workflowData.name || 'New Workflow',
        description: workflowData.description || '',
        enabled: false,
        trigger: workflowData.trigger || getDefaultTrigger(),
        conditions: workflowData.conditions || [],
        actions: workflowData.actions || [],
        frequency: workflowData.frequency || { type: 'once' },
        analytics: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageExecutionTime: 0,
          lastExecutionStatus: 'success',
          errorRate: 0
        }
      });

      setWorkflows(prev => [...prev, newWorkflow]);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleToggleWorkflow = async (workflowId: string, enabled: boolean) => {
    try {
      setWorkflows(prev => 
        prev.map(w => w.id === workflowId ? { ...w, enabled } : w)
      );
      // In real implementation, update via API
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const handleTestWorkflow = async (workflowId: string) => {
    try {
      await integrationEcosystemService.executeWorkflow(workflowId, {
        test: true,
        timestamp: new Date(),
        source: 'manual_test'
      });
      console.log('Workflow test executed');
    } catch (error) {
      console.error('Failed to test workflow:', error);
    }
  };

  const getDefaultTrigger = (): WorkflowTrigger => ({
    type: 'webhook',
    config: {},
    metadata: {}
  });

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'schedule': return <Clock className="w-4 h-4" />;
      case 'email_received': return <Mail className="w-4 h-4" />;
      case 'task_completed': return <CheckCircle className="w-4 h-4" />;
      case 'checklist_created': return <Plus className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <Mail className="w-4 h-4" />;
      case 'create_task': return <Plus className="w-4 h-4" />;
      case 'webhook_call': return <Webhook className="w-4 h-4" />;
      case 'integration_sync': return <Activity className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filterStatus === 'enabled') return workflow.enabled;
    if (filterStatus === 'disabled') return !workflow.enabled;
    return true;
  });

  // Hydration safety - prevent SSR/client mismatch
  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-64 animate-pulse">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="p-6">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FeatureGate feature="workflowAutomation" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-600" />
                Workflow Automation
              </h2>
              <p className="text-gray-600 mt-1">Create trigger-based automations for your integrations</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filterStatus === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('enabled')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filterStatus === 'enabled' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('disabled')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filterStatus === 'disabled' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Inactive
                </button>
              </div>
              
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? 'Create your first workflow to automate repetitive tasks'
                  : `No ${filterStatus} workflows found`
                }
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          workflow.enabled ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'
                        }`}>
                          {workflow.enabled ? 'Active' : 'Inactive'}
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          getStatusColor(workflow.analytics?.lastExecutionStatus || 'unknown')
                        }`}>
                          {workflow.analytics?.lastExecutionStatus || 'Unknown'}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                      
                      {/* Workflow Visual */}
                      <div className="flex items-center space-x-2 mb-4">
                        {/* Trigger */}
                        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          {getTriggerIcon(workflow.trigger?.type || 'unknown')}
                          <span className="text-sm text-blue-700 capitalize">
                            {workflow.trigger?.type?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                        
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        
                        {/* Conditions */}
                        {workflow.conditions.length > 0 && (
                          <>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <Filter className="w-4 h-4" />
                              <span className="text-sm text-yellow-700">
                                {workflow.conditions.length} condition{workflow.conditions.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          {workflow.actions.slice(0, 3).map((action, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                            >
                              {getActionIcon(action?.type || 'unknown')}
                              <span className="text-sm text-green-700 capitalize">
                                {action?.type?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </div>
                          ))}
                          {workflow.actions.length > 3 && (
                            <span className="text-sm text-gray-500">
                              +{workflow.actions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Analytics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Executions:</span>
                          <span className="ml-1 font-medium">{workflow.analytics?.totalExecutions || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="ml-1 font-medium">
                            {workflow.analytics?.totalExecutions > 0 
                              ? Math.round(((workflow.analytics?.successfulExecutions || 0) / (workflow.analytics?.totalExecutions || 1)) * 100)
                              : 0
                            }%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg Time:</span>
                          <span className="ml-1 font-medium">{workflow.analytics?.averageExecutionTime || 0}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Run:</span>
                          <span className="ml-1 font-medium">
                            {workflow.lastRun ? workflow.lastRun.toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleTestWorkflow(workflow.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Test workflow"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit workflow"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleWorkflow(workflow.id, !workflow.enabled)}
                        className={`p-2 rounded-lg transition-colors ${
                          workflow.enabled 
                            ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={workflow.enabled ? 'Disable workflow' : 'Enable workflow'}
                      >
                        {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => {/* Delete workflow */}}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete workflow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow Statistics */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">Total Workflows:</span>
              <span className="font-medium">{workflows.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Active:</span>
              <span className="font-medium">{workflows.filter(w => w.enabled).length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">Total Executions:</span>
              <span className="font-medium">
                {workflows.reduce((sum, w) => sum + (w.analytics?.totalExecutions || 0), 0)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium">
                {workflows.length > 0 
                  ? Math.round(
                      workflows.reduce((sum, w) => 
                        sum + (w.analytics?.totalExecutions > 0 
                          ? ((w.analytics?.successfulExecutions || 0) / (w.analytics?.totalExecutions || 1)) * 100 
                          : 100
                        ), 0
                      ) / workflows.length
                    )
                  : 0
                }%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Workflow Modal */}
      <AnimatePresence>
        {(isCreating || selectedWorkflow) && (
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
                  {isCreating ? 'Create New Workflow' : 'Edit Workflow'}
                </h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Workflow builder interface would go here. This includes:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-6">
                  <li>• Trigger selection (webhook, schedule, email, etc.)</li>
                  <li>• Condition builder with visual interface</li>
                  <li>• Action sequence designer</li>
                  <li>• Field mapping and variable insertion</li>
                  <li>• Test and validation tools</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedWorkflow(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (isCreating) {
                      handleCreateWorkflow({
                        name: 'New Workflow',
                        description: 'Created from template'
                      });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isCreating ? 'Create' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeatureGate>
  );
};

export default WorkflowAutomation;
