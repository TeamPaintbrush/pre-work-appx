"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreWorkChecklist, ChecklistItem, ChecklistSection } from '../../types';
import { progressTracker } from '../../lib/services/progressTracking';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface AnalyticsDashboardProps {
  checklist: PreWorkChecklist;
  checklists?: PreWorkChecklist[]; // For historical analysis
  className?: string;
  onExport?: (data: any) => void;
}

interface AnalyticsData {
  overview: {
    totalProgress: number;
    completionRate: number;
    estimatedCompletion: string;
    efficiency: number;
    qualityScore: number;
  };
  sections: {
    name: string;
    progress: number;
    items: number;
    avgTime: number;
    issues: number;
  }[];
  timeline: {
    date: string;
    progress: number;
    itemsCompleted: number;
  }[];
  insights: string[];
  performance: {
    todayVsAverage: number;
    currentVelocity: number;
    consistencyScore: number;
    focusTime: number;
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  checklist,
  checklists = [],
  className = '',
  onExport
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '🎯' },
    { id: 'sections', label: 'Sections', icon: '📋' },
    { id: 'timeline', label: 'Timeline', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ];

  // Calculate analytics data
  const analyticsData = useMemo((): AnalyticsData => {
    const progressReport = progressTracker.generateProgressReport(checklist);
    const performanceMetrics = progressTracker.getPerformanceMetrics(checklist);
    
    // Calculate section analytics
    const sectionAnalytics = checklist.sections.map(section => {
      const completedItems = section.items.filter(item => item.isCompleted).length;
      const progress = section.items.length > 0 ? (completedItems / section.items.length) * 100 : 0;
      const issues = section.items.filter(item => 
        (!item.isCompleted && item.isRequired) || 
        (item.isSkipped && item.isRequired)
      ).length;
      
      return {
        name: section.title,
        progress: Math.round(progress),
        items: section.items.length,
        avgTime: section.items.reduce((sum, item) => sum + (item.estimatedTime || 5), 0) / section.items.length,
        issues
      };
    });

    // Generate timeline data (mock for now - would be real data from tracking)
    const timeline = [
      { date: '9:00 AM', progress: 0, itemsCompleted: 0 },
      { date: '10:00 AM', progress: 15, itemsCompleted: 3 },
      { date: '11:00 AM', progress: 35, itemsCompleted: 7 },
      { date: '12:00 PM', progress: 50, itemsCompleted: 10 },
      { date: '1:00 PM', progress: 65, itemsCompleted: 13 },
      { date: '2:00 PM', progress: progressReport.overview.percentage, itemsCompleted: progressReport.overview.completedItems }
    ];

    return {
      overview: {
        totalProgress: progressReport.overview.percentage,
        completionRate: progressReport.overview.completionRate,
        estimatedCompletion: progressReport.timeTracking.estimatedCompletion,
        efficiency: performanceMetrics.efficiency,
        qualityScore: performanceMetrics.accuracy
      },
      sections: sectionAnalytics,
      timeline,
      insights: progressReport.insights,
      performance: {
        todayVsAverage: 15, // Mock data
        currentVelocity: progressReport.overview.completionRate,
        consistencyScore: performanceMetrics.consistency,
        focusTime: progressReport.timeTracking.sessionTime
      }
    };
  }, [checklist]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport({
        analytics: analyticsData,
        checklist: checklist.title,
        generatedAt: new Date().toISOString(),
        timeRange
      });
    }
  }, [analyticsData, checklist.title, timeRange, onExport]);

  const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className="text-blue-600"
            initial={{ strokeDasharray, strokeDashoffset: circumference }}
            animate={{ strokeDasharray, strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{progress}%</div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, subtitle, icon, trend }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && '↗️'}
            {trend === 'down' && '↘️'}
            {trend === 'neutral' && '➡️'}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </motion.div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="flex items-center justify-center mb-8">
        <ProgressRing progress={analyticsData.overview.totalProgress} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Completion Rate"
          value={`${analyticsData.overview.completionRate.toFixed(1)}/hr`}
          subtitle="items per hour"
          icon="⚡"
          trend="up"
        />
        <MetricCard
          title="Efficiency Score"
          value={`${analyticsData.overview.efficiency}%`}
          subtitle="vs. estimated time"
          icon="🎯"
          trend={analyticsData.overview.efficiency > 85 ? 'up' : 'neutral'}
        />
        <MetricCard
          title="Quality Score"
          value={`${analyticsData.overview.qualityScore}%`}
          subtitle="accuracy rating"
          icon="✨"
          trend="up"
        />
        <MetricCard
          title="Est. Completion"
          value={analyticsData.overview.estimatedCompletion}
          subtitle="time remaining"
          icon="⏰"
          trend="neutral"
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {checklist.sections.reduce((sum, section) => 
                sum + section.items.filter(item => item.isCompleted).length, 0
              )}
            </div>
            <div className="text-sm text-gray-600">Items Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {checklist.sections.filter(section => 
                section.items.every(item => item.isCompleted)
              ).length}
            </div>
            <div className="text-sm text-gray-600">Sections Done</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(analyticsData.performance.focusTime)}
            </div>
            <div className="text-sm text-gray-600">Minutes Active</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          
          {[
            { label: 'Current Velocity', value: analyticsData.performance.currentVelocity, max: 10, unit: 'items/hr', color: 'blue' },
            { label: 'Consistency Score', value: analyticsData.performance.consistencyScore, max: 100, unit: '%', color: 'green' },
            { label: 'Focus Time', value: analyticsData.performance.focusTime, max: 120, unit: 'min', color: 'purple' }
          ].map((metric, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span className="text-sm text-gray-900">{metric.value.toFixed(1)} {metric.unit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-${metric.color}-500`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Today vs Average</span>
              <span className={`text-sm font-semibold ${
                analyticsData.performance.todayVsAverage > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.performance.todayVsAverage > 0 ? '+' : ''}{analyticsData.performance.todayVsAverage}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Quality vs Target</span>
              <span className="text-sm font-semibold text-blue-600">
                +{analyticsData.overview.qualityScore - 90}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Efficiency vs Expected</span>
              <span className="text-sm font-semibold text-purple-600">
                +{analyticsData.overview.efficiency - 80}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-green-800">
            <span>🎯</span>
            <span>Your completion rate is {analyticsData.performance.currentVelocity > 5 ? 'excellent' : 'good'} - keep up the momentum!</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-800">
            <span>📈</span>
            <span>Consistency score shows {analyticsData.performance.consistencyScore > 80 ? 'steady' : 'variable'} progress patterns.</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-800">
            <span>⏱️</span>
            <span>Focus time of {Math.round(analyticsData.performance.focusTime)} minutes indicates strong concentration.</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSections = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Section Analysis</h3>
      
      <div className="space-y-4">
        {analyticsData.sections.map((section, index) => (
          <motion.div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">{section.name}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{section.items} items</span>
                {section.issues > 0 && (
                  <span className="flex items-center space-x-1 text-orange-600">
                    <span>⚠️</span>
                    <span>{section.issues} issues</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{section.progress}%</div>
                <div className="text-xs text-blue-800">Progress</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(section.avgTime)}m</div>
                <div className="text-xs text-green-800">Avg. Time/Item</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{section.items}</div>
                <div className="text-xs text-purple-800">Total Items</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full ${
                  section.issues > 0 ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${section.progress}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </div>

            {section.issues > 0 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm text-orange-800">
                  ⚠️ {section.issues} item(s) need attention in this section
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Progress Timeline</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {analyticsData.timeline.map((point, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600">{point.date}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{point.progress}% complete</span>
                  <span className="text-sm text-gray-600">{point.itemsCompleted} items</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${point.progress}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Peak Performance</h4>
          <p className="text-sm text-blue-800">
            Your most productive hour was 11:00 AM - 12:00 PM with 15% progress gain.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-semibold text-green-900 mb-2">Momentum Score</h4>
          <p className="text-sm text-green-800">
            Strong consistent progress with minimal slowdowns throughout the session.
          </p>
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
      
      <div className="space-y-4">
        {analyticsData.insights.map((insight, index) => (
          <motion.div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <p className="text-gray-800">{insight}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-4">Recommendations</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-purple-600">🎯</span>
            <p className="text-sm text-purple-800">
              Focus on completing required items first to maintain project compliance.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-600">⚡</span>
            <p className="text-sm text-purple-800">
              Consider batching similar tasks together to improve efficiency.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-600">📸</span>
            <p className="text-sm text-purple-800">
              Take photos during task completion for better documentation quality.
            </p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Export Analytics</h4>
        <div className="flex space-x-3">
          <Button onClick={handleExport} size="sm">
            📊 Export Data
          </Button>
          <Button variant="outline" size="sm">
            📧 Email Report
          </Button>
          <Button variant="outline" size="sm">
            📄 Generate PDF
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <span>📊</span>
        <span>Analytics Dashboard</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Analytics Dashboard"
        size="xl"
      >
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'performance' && renderPerformance()}
              {activeTab === 'sections' && renderSections()}
              {activeTab === 'timeline' && renderTimeline()}
              {activeTab === 'insights' && renderInsights()}
            </motion.div>
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
};

export default AnalyticsDashboard;
