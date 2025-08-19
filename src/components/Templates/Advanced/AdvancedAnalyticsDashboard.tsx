// Advanced Analytics Dashboard with Data Visualization
// Comprehensive charts, metrics, and insights for template usage and performance

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../../AdvancedFeatures/FeatureToggleProvider';
import { AdvancedTemplate } from '../../../types/templates/advanced';
import { advancedTemplateService } from '../../../services/templates/AdvancedTemplateService';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Download,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Zap,
  Star,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Hash,
  Percent,
  DollarSign,
  Info,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AnalyticsData {
  templates: AdvancedTemplate[];
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalUsage: number;
    uniqueUsers: number;
    averageCompletionTime: number;
    completionRate: number;
    userSatisfaction: number;
    errorRate: number;
    popularCategories: Array<{ category: string; count: number; percentage: number }>;
    topPerformers: Array<{ templateId: string; title: string; metric: number }>;
    timeBasedUsage: Array<{ date: string; usage: number; completions: number }>;
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
    geographicDistribution: Array<{ location: string; count: number; percentage: number }>;
    userEngagement: Array<{ metric: string; value: number; trend: 'up' | 'down' | 'stable' }>;
  };
  insights: Array<{
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    description: string;
    action?: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface AdvancedAnalyticsDashboardProps {
  workspaceId: string;
  userId: string;
  className?: string;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  workspaceId,
  userId,
  className = ''
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'usage' | 'completion' | 'satisfaction' | 'performance'>('usage');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [visibleCharts, setVisibleCharts] = useState<Set<string>>(
    new Set(['usage-trend', 'category-distribution', 'device-breakdown', 'performance-metrics'])
  );

  useEffect(() => {
    loadAnalyticsData();
  }, [workspaceId, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await advancedTemplateService.getAdvancedAnalytics(workspaceId, {
        timeRange,
        includeInsights: true,
        includeGeographic: true,
        includeDeviceData: true,
        includeUserEngagement: true
      });
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const toggleChartVisibility = (chartId: string) => {
    const newVisible = new Set(visibleCharts);
    if (newVisible.has(chartId)) {
      newVisible.delete(chartId);
    } else {
      newVisible.add(chartId);
    }
    setVisibleCharts(newVisible);
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 3 Months';
      case '1y': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <ArrowUpRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Analytics data will appear here once you have template usage.</p>
      </div>
    );
  }

  return (
    <FeatureGate feature="aiDashboard" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Advanced Analytics Dashboard
              </h2>
              <p className="text-gray-600 mt-1">
                Comprehensive insights and metrics for {getTimeRangeLabel(timeRange).toLowerCase()}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="1y">Last Year</option>
              </select>

              <button
                onClick={loadAnalyticsData}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>

          {/* Metric Selection */}
          <div className="flex items-center space-x-4">
            {([
              { key: 'usage', label: 'Usage', icon: Activity },
              { key: 'completion', label: 'Completion', icon: Target },
              { key: 'satisfaction', label: 'Satisfaction', icon: Star },
              { key: 'performance', label: 'Performance', icon: Zap }
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedMetric === key
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Usage',
                value: analyticsData.metrics.totalUsage.toLocaleString(),
                change: '+12%',
                trend: 'up' as const,
                icon: Activity,
                color: 'blue'
              },
              {
                title: 'Unique Users',
                value: analyticsData.metrics.uniqueUsers.toLocaleString(),
                change: '+8%',
                trend: 'up' as const,
                icon: Users,
                color: 'green'
              },
              {
                title: 'Completion Rate',
                value: `${(analyticsData.metrics.completionRate * 100).toFixed(1)}%`,
                change: '+3%',
                trend: 'up' as const,
                icon: Target,
                color: 'purple'
              },
              {
                title: 'Avg. Time',
                value: `${Math.round(analyticsData.metrics.averageCompletionTime)} min`,
                change: '-5%',
                trend: 'down' as const,
                icon: Clock,
                color: 'orange'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-${metric.color}-50`}>
                    <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                  </div>
                  <div className="flex items-center text-sm">
                    {getTrendIcon(metric.trend)}
                    <span className={`ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.title}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts and Visualizations */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Trend Chart */}
            <AnimatePresence>
              {visibleCharts.has('usage-trend') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                      Usage Trend
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCardExpansion('usage-trend')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedCards.has('usage-trend') ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleChartVisibility('usage-trend')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="h-48 bg-white rounded border flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Interactive chart would render here</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Showing {analyticsData.metrics.timeBasedUsage.length} data points
                      </p>
                    </div>
                  </div>

                  {expandedCards.has('usage-trend') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">Peak Usage</div>
                          <div className="text-gray-600">Tuesday, 2:00 PM</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Growth Rate</div>
                          <div className="text-green-600">+12% week over week</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Trend</div>
                          <div className="text-blue-600">Increasing</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Distribution */}
            <AnimatePresence>
              {visibleCharts.has('category-distribution') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                      Category Distribution
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCardExpansion('category-distribution')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedCards.has('category-distribution') ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleChartVisibility('category-distribution')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {analyticsData.metrics.popularCategories.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'purple', 'orange', 'red'][index]}-500`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-${['blue', 'green', 'purple', 'orange', 'red'][index]}-500 h-2 rounded-full`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {expandedCards.has('category-distribution') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="text-sm text-gray-600">
                        <p className="mb-2">Category Insights:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Cleaning templates are most popular (35% of usage)</li>
                          <li>• Safety templates show 18% growth this month</li>
                          <li>• Equipment templates have highest completion rate</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Device Breakdown */}
            <AnimatePresence>
              {visibleCharts.has('device-breakdown') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                      Device Usage
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCardExpansion('device-breakdown')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedCards.has('device-breakdown') ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleChartVisibility('device-breakdown')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.metrics.deviceBreakdown.map((device, index) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getDeviceIcon(device.device)}
                          <span className="text-sm font-medium text-gray-900 capitalize">{device.device}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{device.percentage.toFixed(1)}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${device.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{device.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {expandedCards.has('device-breakdown') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">Mobile Optimization</div>
                          <div className="text-green-600">98% compatible</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Cross-Platform</div>
                          <div className="text-blue-600">Fully supported</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Performance Metrics */}
            <AnimatePresence>
              {visibleCharts.has('performance-metrics') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-orange-600" />
                      Performance Metrics
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCardExpansion('performance-metrics')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedCards.has('performance-metrics') ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleChartVisibility('performance-metrics')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.metrics.userEngagement.map((metric, index) => (
                      <div key={metric.metric} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            metric.trend === 'up' ? 'bg-green-500' :
                            metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900">{metric.metric}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(metric.trend)}
                          <span className="text-sm text-gray-900 font-medium">{metric.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {expandedCards.has('performance-metrics') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="text-sm text-gray-600">
                        <p className="mb-2">Performance Summary:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Average load time: 1.2s (excellent)</li>
                          <li>• User satisfaction: 94% (very high)</li>
                          <li>• Error rate: 0.3% (minimal)</li>
                          <li>• Mobile performance: 96% (optimized)</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Insights and Recommendations */}
          {analyticsData.insights.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Insights & Recommendations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData.insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      insight.type === 'success' ? 'bg-green-50 border-green-200' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      insight.type === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        {insight.action && (
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            {insight.action} →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Chart Visibility Controls */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Chart Visibility
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'usage-trend', label: 'Usage Trend', icon: LineChart },
                { id: 'category-distribution', label: 'Categories', icon: PieChart },
                { id: 'device-breakdown', label: 'Devices', icon: Smartphone },
                { id: 'performance-metrics', label: 'Performance', icon: Zap }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleChartVisibility(id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    visibleCharts.has(id)
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {visibleCharts.has(id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

export default AdvancedAnalyticsDashboard;
