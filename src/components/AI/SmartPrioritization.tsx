// Smart Task Prioritization Component
// Maintains UI consistency with existing design system

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/ai/AIService';
import { AITaskPriority } from '../../types/ai';
import { ChecklistItem } from '../../types';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';

interface SmartPrioritizationProps {
  workspaceId: string;
  tasks: ChecklistItem[];
  onPrioritiesUpdated?: (priorities: AITaskPriority[]) => void;
  className?: string;
}

export const SmartPrioritization: React.FC<SmartPrioritizationProps> = ({
  workspaceId,
  tasks,
  onPrioritiesUpdated,
  className = ''
}) => {
  const [priorities, setPriorities] = useState<AITaskPriority[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const generatePriorities = async () => {
    if (tasks.length === 0) return;
    
    setIsLoading(true);
    try {
      const newPriorities = await aiService.generateTaskPriorities(
        workspaceId,
        tasks,
        { userId: 'current-user', timestamp: new Date() }
      );
      
      setPriorities(newPriorities);
      setLastAnalysis(new Date());
      onPrioritiesUpdated?.(newPriorities);
    } catch (error) {
      console.error('Error generating priorities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0 && priorities.length === 0) {
      generatePriorities();
    }
  }, [tasks]);

  const getPriorityColor = (priority: AITaskPriority['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: AITaskPriority['priority']) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚡';
      case 'medium': return '📋';
      case 'low': return '📝';
      default: return '📋';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <FeatureGate feature="aiTaskPrioritization" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🤖</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Task Prioritization
                </h3>
              </div>
              {priorities.length > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {priorities.length} tasks analyzed
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {lastAnalysis && (
                <span className="text-xs text-gray-500">
                  Updated {lastAnalysis.toLocaleTimeString()}
                </span>
              )}
              
              <button
                onClick={generatePriorities}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Refresh Analysis'
                )}
              </button>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                {priorities.length === 0 && !isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-3xl mb-2 block">🎯</span>
                    <p>Click "Refresh Analysis" to get AI-powered task prioritization</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {priorities.map((priority, index) => {
                      const task = tasks.find(t => t.id === priority.taskId);
                      if (!task) return null;

                      return (
                        <motion.div
                          key={priority.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start space-x-3">
                                <span className="text-lg mt-0.5">{getPriorityIcon(priority.priority)}</span>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium text-gray-900 text-sm">
                                      #{priority.suggestedOrder}
                                    </span>
                                    <h4 className="font-medium text-gray-900 flex-1">
                                      {task.text}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priority.priority)}`}>
                                      {priority.priority.toUpperCase()}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mb-3">
                                    {priority.reasoning}
                                  </p>
                                  
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <span>⏱️</span>
                                      <span>{priority.estimatedCompletionTime}m</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <span>🎯</span>
                                      <span className={getConfidenceColor(priority.confidence)}>
                                        {priority.confidence}% confidence
                                      </span>
                                    </div>
                                    {priority.deadlineImpact > 70 && (
                                      <div className="flex items-center space-x-1 text-red-600">
                                        <span>⚠️</span>
                                        <span>High deadline impact</span>
                                      </div>
                                    )}
                                    {priority.dependencies.length > 0 && (
                                      <div className="flex items-center space-x-1">
                                        <span>🔗</span>
                                        <span>{priority.dependencies.length} dependencies</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Priority Factors */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {priority.factors.map((factor, factorIndex) => (
                                <div key={factorIndex} className="text-center">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {factor.type.replace('_', ' ')}
                                  </div>
                                  <div className="flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-700">
                                        {Math.round(factor.value)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isExpanded && priorities.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Next priority:</span>
                  <div className="flex items-center space-x-2">
                    <span>{getPriorityIcon(priorities[0]?.priority)}</span>
                    <span className="font-medium text-gray-900">
                      {tasks.find(t => t.id === priorities[0]?.taskId)?.text}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(priorities[0]?.priority)}`}>
                      {priorities[0]?.priority}
                    </span>
                  </div>
                </div>
                <span className="text-gray-500">
                  {priorities[0]?.estimatedCompletionTime}m
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
};

export default SmartPrioritization;
