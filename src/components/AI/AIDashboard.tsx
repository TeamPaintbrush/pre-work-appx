// AI Dashboard Component
// Central hub for all AI features and insights

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';
import SmartPrioritization from './SmartPrioritization';
import AITaskSuggestions from './AITaskSuggestions';
import SmartProgressPrediction from './SmartProgressPrediction';
import { aiService } from '../../services/ai/AIService';
import { AIInsights, SmartNotification } from '../../types/ai';
import { ChecklistItem } from '../../types';

interface AIDashboardProps {
  workspaceId: string;
  userId: string;
  checklistId?: string;
  tasks?: ChecklistItem[];
  currentProgress?: {
    percentage: number;
    completedTasks: number;
    totalTasks: number;
    velocity?: number;
    timeSpent?: number;
  };
  className?: string;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({
  workspaceId,
  userId,
  checklistId,
  tasks = [],
  currentProgress,
  className = ''
}) => {
  const [insights, setInsights] = useState<AIInsights[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'prioritization' | 'suggestions' | 'progress' | 'insights'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAIInsights = async () => {
    setIsLoading(true);
    try {
      const timeRange = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date()
      };
      
      const newInsights = await aiService.generateAIInsights(workspaceId, timeRange);
      setInsights(newInsights);
      
      const smartNotifications = await aiService.generateSmartNotifications(workspaceId, userId);
      setNotifications(smartNotifications.filter(n => n.priority === 'high' || n.priority === 'medium'));
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [workspaceId, userId]);

  const getInsightIcon = (type: AIInsights['type']) => {
    switch (type) {
      case 'productivity': return '📈';
      case 'quality': return '⭐';
      case 'efficiency': return '⚡';
      case 'team_performance': return '👥';
      case 'predictive': return '🔮';
      default: return '💡';
    }
  };

  const getInsightColor = (impact: AIInsights['impact']) => {
    switch (impact) {
      case 'transformational': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'high': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-green-600 bg-green-50 border-green-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const sections = [
    { key: 'overview', label: 'Overview', icon: '🏠' },
    { key: 'prioritization', label: 'Task Priority', icon: '🎯', disabled: tasks.length === 0 },
    { key: 'suggestions', label: 'AI Suggestions', icon: '💡' },
    { key: 'progress', label: 'Progress Analysis', icon: '📊', disabled: !checklistId || !currentProgress },
    { key: 'insights', label: 'Insights', icon: '🔍', count: insights.length }
  ];

  return (
    <FeatureGate feature="aiDashboard" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🤖</span>
                <h2 className="text-xl font-bold text-gray-900">
                  AI Assistant
                </h2>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full">
                Beta
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <div className="relative">
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {notifications.length} alerts
                  </span>
                </div>
              )}
              
              <button
                onClick={fetchAIInsights}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Refresh'
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

          {isExpanded && (
            <div className="mt-4 flex space-x-1 bg-gray-100 rounded-lg p-1">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key as any)}
                  disabled={section.disabled}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeSection === section.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                    {section.count !== undefined && section.count > 0 && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        activeSection === section.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {section.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Smart Notifications Bar */}
        {notifications.length > 0 && (
          <div className="p-3 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">🔔</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  {notifications[0].title}
                </p>
                <p className="text-xs text-yellow-700">
                  {notifications[0].message}
                </p>
              </div>
              {notifications[0].actionUrl && (
                <button className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded hover:bg-yellow-300 transition-colors">
                  {notifications[0].actionLabel || 'View'}
                </button>
              )}
            </div>
          </div>
        )}

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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Overview Section */}
                    {activeSection === 'overview' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-blue-600">🎯</span>
                              <h3 className="font-medium text-blue-900">Task Optimization</h3>
                            </div>
                            <p className="text-sm text-blue-800">
                              {tasks.length > 0 ? `${tasks.length} tasks ready for AI prioritization` : 'No tasks to optimize'}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-green-600">📊</span>
                              <h3 className="font-medium text-green-900">Progress Tracking</h3>
                            </div>
                            <p className="text-sm text-green-800">
                              {currentProgress ? `${currentProgress.percentage}% complete` : 'No active checklist'}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-purple-600">💡</span>
                              <h3 className="font-medium text-purple-900">AI Insights</h3>
                            </div>
                            <p className="text-sm text-purple-800">
                              {insights.length} intelligent recommendations available
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                              onClick={() => setActiveSection('prioritization')}
                              disabled={tasks.length === 0}
                              className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <div className="text-sm font-medium text-gray-900">Prioritize Tasks</div>
                              <div className="text-xs text-gray-600">AI-powered ordering</div>
                            </button>
                            
                            <button
                              onClick={() => setActiveSection('suggestions')}
                              className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="text-sm font-medium text-gray-900">Get Suggestions</div>
                              <div className="text-xs text-gray-600">Smart recommendations</div>
                            </button>
                            
                            <button
                              onClick={() => setActiveSection('progress')}
                              disabled={!checklistId}
                              className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <div className="text-sm font-medium text-gray-900">Analyze Progress</div>
                              <div className="text-xs text-gray-600">Completion prediction</div>
                            </button>
                            
                            <button
                              onClick={() => setActiveSection('insights')}
                              className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="text-sm font-medium text-gray-900">View Insights</div>
                              <div className="text-xs text-gray-600">AI-generated reports</div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Task Prioritization Section */}
                    {activeSection === 'prioritization' && (
                      <SmartPrioritization
                        workspaceId={workspaceId}
                        tasks={tasks}
                        onPrioritiesUpdated={(priorities) => {
                          console.log('Priorities updated:', priorities);
                        }}
                      />
                    )}

                    {/* AI Suggestions Section */}
                    {activeSection === 'suggestions' && (
                      <AITaskSuggestions
                        workspaceId={workspaceId}
                        userId={userId}
                        onSuggestionAccepted={(suggestion) => {
                          console.log('Suggestion accepted:', suggestion);
                        }}
                      />
                    )}

                    {/* Progress Analysis Section */}
                    {activeSection === 'progress' && checklistId && currentProgress && (
                      <SmartProgressPrediction
                        workspaceId={workspaceId}
                        checklistId={checklistId}
                        currentProgress={currentProgress}
                        onRecommendationAccepted={(recommendation) => {
                          console.log('Recommendation accepted:', recommendation);
                        }}
                      />
                    )}

                    {/* AI Insights Section */}
                    {activeSection === 'insights' && (
                      <div className="space-y-4">
                        {insights.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <span className="text-3xl mb-2 block">🔍</span>
                            <p className="text-lg font-medium mb-1">No insights available</p>
                            <p className="text-sm">AI insights will appear as you use the system</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {insights.map((insight, index) => (
                              <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`border rounded-lg p-4 ${getInsightColor(insight.impact)}`}
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-2xl flex-shrink-0">
                                    {getInsightIcon(insight.type)}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-medium text-gray-900">
                                        {insight.title}
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-white border">
                                          {insight.impact} impact
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {insight.confidence}% confidence
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-700 mb-3">
                                      {insight.insight}
                                    </p>
                                    
                                    {insight.actionable && insight.suggestedActions.length > 0 && (
                                      <div className="bg-white bg-opacity-50 rounded p-3">
                                        <h5 className="text-sm font-medium mb-2">Suggested actions:</h5>
                                        <ul className="text-sm space-y-1">
                                          {insight.suggestedActions.map((action, actionIndex) => (
                                            <li key={actionIndex} className="flex items-start space-x-2">
                                              <span className="text-blue-600">•</span>
                                              <span>{action}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed State Summary */}
        {!isExpanded && (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">{tasks.length}</div>
                <div className="text-xs text-gray-600">Tasks to optimize</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {currentProgress?.percentage || 0}%
                </div>
                <div className="text-xs text-gray-600">Progress tracked</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">{insights.length}</div>
                <div className="text-xs text-gray-600">AI insights</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
};

export default AIDashboard;
