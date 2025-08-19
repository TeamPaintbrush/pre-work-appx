// Advanced Templates Dashboard Integration
// Central hub for all advanced template features and management

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../../AdvancedFeatures/FeatureToggleProvider';
import { AdvancedTemplate } from '../../../types/templates/advanced';
import { advancedTemplateService } from '../../../services/templates/AdvancedTemplateService';

// Import Advanced Components
import DynamicTemplateBuilder from './DynamicTemplateBuilder';
import EnhancedTemplateGallery from './EnhancedTemplateGallery';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import MobileTemplateInterface from './MobileTemplateInterface';

import {
  Layers,
  Plus,
  BarChart3,
  Settings,
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  Edit3,
  Play,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  Star,
  TrendingUp,
  Users,
  Clock,
  Target,
  Award,
  Activity,
  FileText,
  Download,
  Upload,
  Share,
  BookmarkCheck,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface AdvancedTemplatesDashboardProps {
  workspaceId: string;
  userId: string;
  className?: string;
}

export const AdvancedTemplatesDashboard: React.FC<AdvancedTemplatesDashboardProps> = ({
  workspaceId,
  userId,
  className = ''
}) => {
  const [activeView, setActiveView] = useState<'gallery' | 'builder' | 'analytics' | 'mobile'>('gallery');
  const [templates, setTemplates] = useState<AdvancedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AdvancedTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [quickStats, setQuickStats] = useState({
    totalTemplates: 0,
    totalUsage: 0,
    averageRating: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadTemplates();
    loadQuickStats();
    checkFirstTime();
  }, [workspaceId]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const loadedTemplates = await advancedTemplateService.getTemplatesWithAnalytics(workspaceId);
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuickStats = async () => {
    try {
      const stats = await advancedTemplateService.getQuickStats(workspaceId);
      setQuickStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkFirstTime = () => {
    const hasVisited = localStorage.getItem(`advanced-templates-visited-${workspaceId}`);
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem(`advanced-templates-visited-${workspaceId}`, 'true');
    }
  };

  const handleTemplateSelect = (template: AdvancedTemplate) => {
    setSelectedTemplate(template);
    setActiveView('mobile');
  };

  const handleTemplateEdit = (template: AdvancedTemplate) => {
    setSelectedTemplate(template);
    setActiveView('builder');
  };

  const handleTemplateComplete = async (templateId: string, results: any) => {
    try {
      await advancedTemplateService.recordCompletion(templateId, userId, results);
      await loadQuickStats();
    } catch (error) {
      console.error('Error recording completion:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setActiveView('builder');
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'gallery': return <Grid3X3 className="w-4 h-4" />;
      case 'builder': return <Edit3 className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading advanced templates...</span>
      </div>
    );
  }

  return (
    <FeatureGate feature="aiDashboard" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {/* Welcome Modal */}
        <AnimatePresence>
          {showWelcome && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowWelcome(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome to Advanced Templates!
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                      Create powerful, dynamic templates with conditional logic, analytics, and mobile optimization.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Edit3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="font-medium">Smart Builder</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="font-medium">Analytics</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Smartphone className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="font-medium">Mobile Ready</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <Zap className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <div className="font-medium">AI Enhanced</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowWelcome(false)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Get Started
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Layers className="w-7 h-7 mr-3 text-blue-600" />
                Advanced Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Create, manage, and analyze powerful template workflows
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowWelcome(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Show Welcome"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              <button
                onClick={loadTemplates}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleCreateNew}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Templates',
                value: quickStats.totalTemplates.toLocaleString(),
                icon: FileText,
                color: 'blue',
                change: '+12%'
              },
              {
                label: 'Total Usage',
                value: quickStats.totalUsage.toLocaleString(),
                icon: Activity,
                color: 'green',
                change: '+23%'
              },
              {
                label: 'Avg Rating',
                value: quickStats.averageRating.toFixed(1),
                icon: Star,
                color: 'yellow',
                change: '+0.3'
              },
              {
                label: 'Completion',
                value: `${(quickStats.completionRate * 100).toFixed(1)}%`,
                icon: Target,
                color: 'purple',
                change: '+5%'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 border-${stat.color}-100 bg-${stat.color}-50`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'gallery', label: 'Gallery', description: 'Browse templates' },
              { key: 'builder', label: 'Builder', description: 'Create & edit' },
              { key: 'analytics', label: 'Analytics', description: 'View insights' },
              { key: 'mobile', label: 'Mobile', description: 'Mobile preview' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeView === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {getViewIcon(tab.key)}
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeView === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <EnhancedTemplateGallery
                  templates={templates}
                  workspaceId={workspaceId}
                  userId={userId}
                  onTemplateSelect={handleTemplateSelect}
                  onTemplateEdit={handleTemplateEdit}
                  onTemplatePreview={(template) => {
                    setSelectedTemplate(template);
                    setActiveView('mobile');
                  }}
                  className="border-0 shadow-none"
                />
              </motion.div>
            )}

            {activeView === 'builder' && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DynamicTemplateBuilder
                  templateId={selectedTemplate?.id}
                  workspaceId={workspaceId}
                  userId={userId}
                  onSave={(template) => {
                    loadTemplates();
                    setActiveView('gallery');
                  }}
                  onPreview={(template) => {
                    setSelectedTemplate(template);
                    setActiveView('mobile');
                  }}
                  className="border-0 shadow-none"
                />
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AdvancedAnalyticsDashboard
                  workspaceId={workspaceId}
                  userId={userId}
                  className="border-0 shadow-none"
                />
              </motion.div>
            )}

            {activeView === 'mobile' && (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-[600px] bg-gray-100 rounded-lg overflow-hidden"
              >
                <div className="h-full max-w-sm mx-auto bg-white border-l border-r border-gray-300">
                  <MobileTemplateInterface
                    template={selectedTemplate || undefined}
                    workspaceId={workspaceId}
                    userId={userId}
                    onTemplateSelect={handleTemplateSelect}
                    onTemplateComplete={handleTemplateComplete}
                    className="h-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{quickStats.totalUsage} total uses</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Last updated today</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-1" />
                Export All
              </button>

              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload className="w-4 h-4 mr-1" />
                Import
              </button>

              <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Share className="w-4 h-4 mr-1" />
                Share Workspace
              </button>

              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

export default AdvancedTemplatesDashboard;
