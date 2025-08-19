// Smart Progress Prediction Component
// AI-powered progress analysis and completion forecasting

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/ai/AIService';
import { SmartProgress, Bottleneck, ProgressRecommendation, RiskFactor } from '../../types/ai';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';

interface SmartProgressPredictionProps {
  workspaceId: string;
  checklistId: string;
  currentProgress: {
    percentage: number;
    completedTasks: number;
    totalTasks: number;
    velocity?: number;
    timeSpent?: number;
  };
  onRecommendationAccepted?: (recommendation: ProgressRecommendation) => void;
  className?: string;
}

export const SmartProgressPrediction: React.FC<SmartProgressPredictionProps> = ({
  workspaceId,
  checklistId,
  currentProgress,
  onRecommendationAccepted,
  className = ''
}) => {
  const [smartProgress, setSmartProgress] = useState<SmartProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bottlenecks' | 'recommendations' | 'risks'>('overview');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const analyzeProgress = async () => {
    setIsLoading(true);
    try {
      const analysis = await aiService.analyzeSmartProgress(
        workspaceId,
        checklistId,
        currentProgress
      );
      
      setSmartProgress(analysis);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error analyzing progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    analyzeProgress();
  }, [checklistId, currentProgress.percentage]);

  const getCompletionColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBottleneckSeverityColor = (severity: Bottleneck['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskColor = (probability: number, impact: number) => {
    const risk = (probability * impact) / 100;
    if (risk >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (risk >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (risk >= 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysUntilCompletion = (completionDate: Date) => {
    const now = new Date();
    const diffTime = completionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!smartProgress && !isLoading) {
    return null;
  }

  return (
    <FeatureGate feature="aiProgressPrediction" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-xl">📊</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Smart Progress Analysis
                </h3>
                <p className="text-sm text-gray-600">
                  AI-powered completion prediction and optimization
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {lastUpdate && (
                <span className="text-xs text-gray-500">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={analyzeProgress}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: '📈' },
              { key: 'bottlenecks', label: 'Bottlenecks', icon: '🚧', count: smartProgress?.bottlenecks.length },
              { key: 'recommendations', label: 'Recommendations', icon: '💡', count: smartProgress?.recommendations.length },
              { key: 'risks', label: 'Risks', icon: '⚠️', count: smartProgress?.riskFactors.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      activeTab === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : smartProgress && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Completion Prediction */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Completion Prediction</h4>
                        <span className={`text-sm font-medium ${getCompletionColor(smartProgress.completionConfidence)}`}>
                          {smartProgress.completionConfidence}% confidence
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {formatDate(smartProgress.predictedCompletion)}
                          </div>
                          <div className="text-sm text-gray-600">Predicted completion</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {getDaysUntilCompletion(smartProgress.predictedCompletion)} days
                          </div>
                          <div className="text-sm text-gray-600">Time remaining</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {smartProgress.velocity.toFixed(1)}/hr
                          </div>
                          <div className="text-sm text-gray-600">Current velocity</div>
                        </div>
                      </div>
                    </div>

                    {/* Quality Score */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Quality Score</h4>
                          <p className="text-sm text-gray-600">
                            Based on completion patterns and attention to detail
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">
                            {smartProgress.qualityScore}
                          </div>
                          <div className="text-sm text-gray-600">out of 100</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{smartProgress.bottlenecks.length}</div>
                        <div className="text-xs text-gray-600">Bottlenecks</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{smartProgress.recommendations.length}</div>
                        <div className="text-xs text-gray-600">Recommendations</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{smartProgress.riskFactors.length}</div>
                        <div className="text-xs text-gray-600">Risk Factors</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{smartProgress.optimizationOpportunities.length}</div>
                        <div className="text-xs text-gray-600">Optimizations</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottlenecks Tab */}
                {activeTab === 'bottlenecks' && (
                  <div className="space-y-3">
                    {smartProgress.bottlenecks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-3xl mb-2 block">✅</span>
                        <p className="text-lg font-medium mb-1">No bottlenecks detected</p>
                        <p className="text-sm">Your workflow is running smoothly!</p>
                      </div>
                    ) : (
                      smartProgress.bottlenecks.map((bottleneck, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border rounded-lg p-4 ${getBottleneckSeverityColor(bottleneck.severity)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {bottleneck.description}
                            </h4>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white border">
                              {bottleneck.severity}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="text-sm text-gray-600">Estimated delay:</span>
                              <span className="ml-2 font-medium">{bottleneck.estimatedDelay}h</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Affected tasks:</span>
                              <span className="ml-2 font-medium">{bottleneck.affectedTasks.length}</span>
                            </div>
                          </div>
                          
                          {bottleneck.suggestedActions.length > 0 && (
                            <div className="bg-white bg-opacity-50 rounded p-3">
                              <h5 className="text-sm font-medium mb-2">Suggested actions:</h5>
                              <ul className="text-sm space-y-1">
                                {bottleneck.suggestedActions.map((action, actionIndex) => (
                                  <li key={actionIndex} className="flex items-start space-x-2">
                                    <span className="text-blue-600">•</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-3">
                    {smartProgress.recommendations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-3xl mb-2 block">🎯</span>
                        <p className="text-lg font-medium mb-1">No recommendations available</p>
                        <p className="text-sm">Your workflow is optimized!</p>
                      </div>
                    ) : (
                      smartProgress.recommendations.map((recommendation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {recommendation.description}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                recommendation.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {recommendation.priority}
                              </span>
                              <button
                                onClick={() => onRecommendationAccepted?.(recommendation)}
                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {recommendation.expectedImpact}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏱️ {recommendation.timeToImplement}m to implement</span>
                            <span>🎯 {recommendation.implementationEffort} effort</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Risks Tab */}
                {activeTab === 'risks' && (
                  <div className="space-y-3">
                    {smartProgress.riskFactors.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-3xl mb-2 block">🛡️</span>
                        <p className="text-lg font-medium mb-1">No risks detected</p>
                        <p className="text-sm">Your project is on track!</p>
                      </div>
                    ) : (
                      smartProgress.riskFactors.map((risk, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border rounded-lg p-4 ${getRiskColor(risk.probability, risk.impact)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {risk.description}
                            </h4>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white border">
                              {Math.round((risk.probability * risk.impact) / 100)}% risk
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="text-sm text-gray-600">Probability:</span>
                              <span className="ml-2 font-medium">{risk.probability}%</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Impact:</span>
                              <span className="ml-2 font-medium">{risk.impact}%</span>
                            </div>
                          </div>
                          
                          {risk.mitigationStrategies.length > 0 && (
                            <div className="bg-white bg-opacity-50 rounded p-3">
                              <h5 className="text-sm font-medium mb-2">Mitigation strategies:</h5>
                              <ul className="text-sm space-y-1">
                                {risk.mitigationStrategies.map((strategy, strategyIndex) => (
                                  <li key={strategyIndex} className="flex items-start space-x-2">
                                    <span className="text-blue-600">•</span>
                                    <span>{strategy}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </FeatureGate>
  );
};

export default SmartProgressPrediction;
