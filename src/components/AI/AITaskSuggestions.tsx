// AI Task Suggestions Component
// Provides intelligent recommendations and automation suggestions

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/ai/AIService';
import { AITaskSuggestion } from '../../types/ai';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';

interface AITaskSuggestionsProps {
  workspaceId: string;
  userId: string;
  onSuggestionAccepted?: (suggestion: AITaskSuggestion) => void;
  className?: string;
}

export const AITaskSuggestions: React.FC<AITaskSuggestionsProps> = ({
  workspaceId,
  userId,
  onSuggestionAccepted,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const newSuggestions = await aiService.generateTaskSuggestions(workspaceId, userId, {
        includeOptimizations: true,
        includeTemplateRecommendations: true,
        personalizedContext: true
      });
      
      setSuggestions(newSuggestions.filter(s => !dismissedSuggestions.has(s.id)));
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [workspaceId, userId]);

  const handleAcceptSuggestion = (suggestion: AITaskSuggestion) => {
    onSuggestionAccepted?.(suggestion);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set(Array.from(prev).concat([suggestionId])));
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getSuggestionIcon = (type: AITaskSuggestion['type']) => {
    switch (type) {
      case 'next_task': return '🎯';
      case 'optimization': return '⚡';
      case 'workflow_improvement': return '🔄';
      case 'template_recommendation': return '📋';
      default: return '💡';
    }
  };

  const getImpactColor = (impact: AITaskSuggestion['impact']) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEffortBadge = (effort: AITaskSuggestion['effort']) => {
    const colors = {
      minimal: 'bg-green-100 text-green-800',
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${colors[effort]}`;
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion.type === filter;
  });

  const suggestionTypes = [
    { value: 'all', label: 'All Suggestions', count: suggestions.length },
    { value: 'next_task', label: 'Next Tasks', count: suggestions.filter(s => s.type === 'next_task').length },
    { value: 'optimization', label: 'Optimizations', count: suggestions.filter(s => s.type === 'optimization').length },
    { value: 'workflow_improvement', label: 'Workflow', count: suggestions.filter(s => s.type === 'workflow_improvement').length },
    { value: 'template_recommendation', label: 'Templates', count: suggestions.filter(s => s.type === 'template_recommendation').length }
  ];

  return (
    <FeatureGate feature="aiTaskSuggestions" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Suggestions
                </h3>
                <p className="text-sm text-gray-600">
                  Intelligent recommendations to optimize your workflow
                </p>
              </div>
            </div>
            
            <button
              onClick={fetchSuggestions}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Refresh'
              )}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {suggestionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === type.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{type.label}</span>
                  {type.count > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      filter === type.value ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {type.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-3xl mb-2 block">
                {filter === 'all' ? '💡' : getSuggestionIcon(filter as AITaskSuggestion['type'])}
              </span>
              <p className="text-lg font-medium mb-1">
                {filter === 'all' ? 'No suggestions available' : `No ${filter.replace('_', ' ')} suggestions`}
              </p>
              <p className="text-sm">
                {filter === 'all' 
                  ? 'Check back later for AI-powered recommendations'
                  : 'Try checking other suggestion categories'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getSuggestionIcon(suggestion.type)}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 pr-2">
                              {suggestion.title}
                            </h4>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getImpactColor(suggestion.impact)}`}>
                                {suggestion.impact} impact
                              </span>
                              <span className={getEffortBadge(suggestion.effort)}>
                                {suggestion.effort} effort
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {suggestion.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span>🎯</span>
                                <span>{suggestion.confidence}% confidence</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>📊</span>
                                <span>{suggestion.category}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDismissSuggestion(suggestion.id)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleAcceptSuggestion(suggestion)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                          
                          {suggestion.suggestedAction && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                  <span className="text-blue-600 text-sm">💡</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900 mb-1">
                                      Suggested Action:
                                    </p>
                                    <p className="text-sm text-blue-800">
                                      {suggestion.suggestedAction}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </FeatureGate>
  );
};

export default AITaskSuggestions;
