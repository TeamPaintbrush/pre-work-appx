// Integration Analytics Dashboard
// Comprehensive performance metrics and insights

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';
import { 
  IntegrationAnalytics, 
  AnalyticsMetric, 
  AnalyticsChart,
  AnalyticsInsight 
} from '../../types/integrations';
import { integrationEcosystemService } from '../../services/integrations/IntegrationEcosystemService';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Eye,
  PieChart,
  LineChart,
  BarChart,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';

interface IntegrationAnalyticsDashboardProps {
  workspaceId: string;
  className?: string;
}

export const IntegrationAnalyticsDashboard: React.FC<IntegrationAnalyticsDashboardProps> = ({
  workspaceId,
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedChart, setSelectedChart] = useState<AnalyticsChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [workspaceId, selectedPeriod]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, workspaceId, selectedPeriod]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const analyticsData = await integrationEcosystemService.getIntegrationAnalytics(workspaceId, selectedPeriod);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="w-5 h-5" />;
      case 'reliability': return <CheckCircle className="w-5 h-5" />;
      case 'usage': return <Activity className="w-5 h-5" />;
      case 'efficiency': return <Zap className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'area': return <Activity className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      case 'anomaly': return <AlertTriangle className="w-5 h-5" />;
      case 'recommendation': return <Target className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      default: return <Eye className="w-5 h-5" />;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'percentage') return `${value}%`;
    if (unit === 'ms') return `${value}ms`;
    if (unit === 'GB') return `${value}GB`;
    if (unit === 'MB') return `${value}MB`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const exportAnalytics = async () => {
    if (!analytics) return;
    
    const exportData = {
      period: analytics.period,
      metrics: analytics.metrics,
      insights: analytics.insights,
      generatedAt: analytics.generatedAt
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FeatureGate feature="integrationAnalytics" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Integration Analytics
              </h2>
              <p className="text-gray-600 mt-1">Monitor performance and get insights on your integrations</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedPeriod('day')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedPeriod === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setSelectedPeriod('week')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedPeriod === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedPeriod === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Month
                </button>
              </div>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
              
              <button
                onClick={exportAnalytics}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              
              <button
                onClick={loadAnalytics}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {analytics ? (
          <div className="p-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {analytics.metrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-lg border ${getMetricColor(metric.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getMetricIcon(metric.category)}
                      <h3 className="font-medium">{metric.name}</h3>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <div className="text-2xl font-bold">
                      {formatValue(metric.value, metric.unit)}
                    </div>
                    <div className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </div>
                  </div>
                  
                  {metric.target && (
                    <div className="mt-2 text-sm text-gray-600">
                      Target: {formatValue(metric.target, metric.unit)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance Charts
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analytics.charts.map((chart) => (
                  <motion.div
                    key={chart.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedChart(chart)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center">
                          {getChartIcon(chart.type)}
                          <span className="ml-2">{chart.title}</span>
                        </h4>
                        <p className="text-sm text-gray-600">{chart.description}</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {/* Simple chart visualization */}
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">
                          {chart.data.length} data points
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {chart.type} chart
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>Last updated: {new Date().toLocaleTimeString()}</span>
                      <span className="capitalize">{chart.config.aggregation}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                AI Insights & Recommendations
              </h3>
              
              {analytics.insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No insights available yet</p>
                  <p className="text-sm">Insights will appear as your integrations generate more data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.insights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border ${getInsightColor(insight.severity)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-1 bg-white rounded-full">
                                {insight.confidence}% confidence
                              </span>
                              <span className="text-xs px-2 py-1 bg-white rounded-full capitalize">
                                {insight.type}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3">{insight.description}</p>
                          
                          {insight.actionable && insight.suggestedActions.length > 0 && (
                            <div className="bg-white bg-opacity-50 rounded p-3">
                              <h5 className="text-sm font-medium mb-2">Suggested Actions:</h5>
                              <ul className="text-sm space-y-1">
                                {insight.suggestedActions.map((action, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <CheckCircle className="w-3 h-3 mt-0.5 text-green-600" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                            <span>Generated: {insight.generatedAt.toLocaleString()}</span>
                            {insight.relatedMetrics.length > 0 && (
                              <span>Related to {insight.relatedMetrics.length} metrics</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
            <p className="text-gray-600">Analytics will appear once your integrations start processing data</p>
          </div>
        )}

        {/* Period Summary */}
        {analytics && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Period: {analytics.period.startDate.toLocaleDateString()} - {analytics.period.endDate.toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Generated: {analytics.generatedAt.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{analytics.metrics.length} metrics tracked</span>
                <span>{analytics.charts.length} charts available</span>
                <span>{analytics.insights.length} insights generated</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Detail Modal */}
      <AnimatePresence>
        {selectedChart && (
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
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      {getChartIcon(selectedChart.type)}
                      <span className="ml-2">{selectedChart.title}</span>
                    </h3>
                    <p className="text-gray-600">{selectedChart.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedChart(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700 mb-2">
                      {selectedChart.data.length}
                    </div>
                    <div className="text-gray-500">Data Points</div>
                    <div className="text-sm text-gray-400 mt-2">
                      Interactive {selectedChart.type} chart would render here
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Chart Type:</span>
                    <span className="ml-1 font-medium capitalize">{selectedChart.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Points:</span>
                    <span className="ml-1 font-medium">{selectedChart.data.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">X-Axis:</span>
                    <span className="ml-1 font-medium">{selectedChart.config.xAxis}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Y-Axis:</span>
                    <span className="ml-1 font-medium">{selectedChart.config.yAxis}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FeatureGate>
  );
};

export default IntegrationAnalyticsDashboard;
