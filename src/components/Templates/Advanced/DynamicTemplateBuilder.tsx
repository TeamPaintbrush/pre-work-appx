// Dynamic Template Builder Component
// Interactive template creation with conditional steps and dynamic content

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../../AdvancedFeatures/FeatureToggleProvider';
import {
  AdvancedTemplate,
  TemplateVariable,
  ConditionalStep,
  DynamicContent,
  WorkflowStep,
  TemplateContext,
  ValidationError
} from '../../../types/templates/advanced';
import { advancedTemplateService } from '../../../services/templates/AdvancedTemplateService';
import {
  Plus,
  Settings,
  Eye,
  Save,
  Play,
  Pause,
  Edit3,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Code,
  Type,
  Hash,
  Calendar,
  Upload,
  Link,
  ToggleLeft,
  ToggleRight,
  Layers,
  GitBranch,
  Workflow,
  Target,
  BarChart3,
  Users,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface DynamicTemplateBuilderProps {
  templateId?: string;
  workspaceId: string;
  userId: string;
  onSave?: (template: AdvancedTemplate) => void;
  onPreview?: (template: AdvancedTemplate) => void;
  className?: string;
}

export const DynamicTemplateBuilder: React.FC<DynamicTemplateBuilderProps> = ({
  templateId,
  workspaceId,
  userId,
  onSave,
  onPreview,
  className = ''
}) => {
  const [template, setTemplate] = useState<AdvancedTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'variables' | 'conditions' | 'content' | 'workflow' | 'preview'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else {
      initializeNewTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      // Load existing template and enhance it
      const baseTemplate = await getBaseTemplate(templateId!);
      const context: TemplateContext = {
        userId,
        workspaceId,
        templateId: templateId!,
        variables: {},
        userProfile: await getUserProfile(userId),
        environment: getCurrentEnvironment(),
        previousSteps: []
      };
      
      const enhanced = await advancedTemplateService.enhanceTemplate(baseTemplate, context);
      setTemplate(enhanced);
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeNewTemplate = () => {
    const newTemplate: AdvancedTemplate = {
      id: `template_${Date.now()}`,
      title: 'New Advanced Template',
      description: 'A new template with enhanced features',
      category: 'custom',
      items: [],
      estimatedTime: 30,
      difficulty: 'medium',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      version: '1.0',
      variables: [],
      conditionalSteps: [],
      dynamicContent: [],
      workflowSteps: [],
      qualityMetrics: {
        overallScore: 0,
        completeness: 0,
        clarity: 0,
        usability: 0,
        efficiency: 0,
        accessibility: 0,
        mobileOptimization: 0,
        lastEvaluated: new Date(),
        evaluationCriteria: [],
        recommendations: []
      },
      personalization: {
        enabled: false,
        userProfiles: [],
        adaptiveContent: [],
        learningEnabled: false,
        privacySettings: {
          dataRetention: 30,
          anonymizeData: true,
          gdprCompliant: true,
          consentRequired: true,
          optOutAvailable: true
        }
      },
      analytics: {
        usageStats: {
          totalUsage: 0,
          uniqueUsers: 0,
          averageCompletionTime: 0,
          popularVariations: [],
          deviceBreakdown: [],
          timeBasedUsage: [],
          geographicUsage: []
        },
        performanceMetrics: {
          loadTime: 0,
          renderTime: 0,
          interactionLatency: 0,
          errorRate: 0,
          abandonmentRate: 0,
          satisfactionScore: 0
        },
        userFeedback: [],
        completionAnalytics: {
          totalCompletions: 0,
          averageCompletionRate: 0,
          completionTimeDistribution: [],
          dropOffPoints: [],
          successFactors: []
        },
        errorAnalytics: {
          totalErrors: 0,
          errorTypes: [],
          errorTrends: [],
          impactAnalysis: []
        }
      }
    };
    setTemplate(newTemplate);
  };

  const handleSave = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      // Validate template before saving
      const validation = await validateTemplate(template);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Save to AWS
      await saveTemplate(template);
      
      if (onSave) {
        onSave(template);
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (template && onPreview) {
      onPreview(template);
    }
  };

  const addVariable = () => {
    if (!template) return;

    const newVariable: TemplateVariable = {
      id: `var_${Date.now()}`,
      name: 'newVariable',
      type: 'text',
      label: 'New Variable',
      required: false,
      validation: [],
      options: [],
      dependencies: []
    };

    setTemplate({
      ...template,
      variables: [...template.variables, newVariable]
    });
  };

  const updateVariable = (variableId: string, updates: Partial<TemplateVariable>) => {
    if (!template) return;

    setTemplate({
      ...template,
      variables: template.variables.map(variable =>
        variable.id === variableId ? { ...variable, ...updates } : variable
      )
    });
  };

  const removeVariable = (variableId: string) => {
    if (!template) return;

    setTemplate({
      ...template,
      variables: template.variables.filter(variable => variable.id !== variableId)
    });
  };

  const addConditionalStep = () => {
    if (!template) return;

    const newConditionalStep: ConditionalStep = {
      id: `cond_${Date.now()}`,
      stepId: '',
      conditions: [],
      logicalOperator: 'AND',
      action: 'show',
      priority: 1
    };

    setTemplate({
      ...template,
      conditionalSteps: [...template.conditionalSteps, newConditionalStep]
    });
  };

  const addDynamicContent = () => {
    if (!template) return;

    const newDynamicContent: DynamicContent = {
      id: `content_${Date.now()}`,
      targetType: 'description',
      targetId: '',
      contentTemplate: 'Hello {{userName}}, welcome to this template!',
      variables: ['userName'],
      contentType: 'text',
      formatters: []
    };

    setTemplate({
      ...template,
      dynamicContent: [...template.dynamicContent, newDynamicContent]
    });
  };

  const getPreviewIcon = () => {
    switch (previewMode) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'basic': return <Edit3 className="w-4 h-4" />;
      case 'variables': return <Code className="w-4 h-4" />;
      case 'conditions': return <GitBranch className="w-4 h-4" />;
      case 'content': return <Type className="w-4 h-4" />;
      case 'workflow': return <Workflow className="w-4 h-4" />;
      case 'preview': return <Eye className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Template not found</h3>
        <p className="text-gray-600">The template could not be loaded or does not exist.</p>
      </div>
    );
  }

  return (
    <FeatureGate feature="aiDashboard" fallback={null}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Layers className="w-6 h-6 mr-2 text-blue-600" />
                Dynamic Template Builder
              </h2>
              <p className="text-gray-600 mt-1">Create advanced templates with conditional logic and dynamic content</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  showAdvanced 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <Settings className="w-4 h-4 mr-1" />
                Advanced
              </button>

              <button
                onClick={handlePreview}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={!template}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving || !template}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Template
              </button>
            </div>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Validation Errors</h4>
                  <ul className="mt-2 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {(['basic', 'variables', 'conditions', 'content', 'workflow', 'preview'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Basic Template Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Title
                    </label>
                    <input
                      type="text"
                      value={template.title}
                      onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={
                        typeof template.category === 'string'
                          ? template.category
                          : template.category && typeof template.category === 'object' && 'name' in template.category 
                            ? (template.category as { name: string }).name
                            : ''
                      }
                      onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cleaning">Cleaning</option>
                      <option value="safety">Safety</option>
                      <option value="equipment">Equipment</option>
                      <option value="events">Events</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this template is for and how to use it"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={template.estimatedTime}
                      onChange={(e) => setTemplate({ ...template, estimatedTime: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="1440"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={template.difficulty}
                      onChange={(e) => setTemplate({ ...template, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={template.version}
                      onChange={(e) => setTemplate({ ...template, version: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1.0"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'variables' && (
              <motion.div
                key="variables"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Template Variables</h3>
                  <button
                    onClick={addVariable}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variable
                  </button>
                </div>

                {template.variables.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No variables defined</h4>
                    <p className="text-gray-600 mb-4">Add variables to make your template dynamic and reusable</p>
                    <button
                      onClick={addVariable}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Variable
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {template.variables.map((variable, index) => (
                      <motion.div
                        key={variable.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Code className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Variable {index + 1}</span>
                          </div>
                          <button
                            onClick={() => removeVariable(variable.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={variable.name}
                              onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="variableName"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                            <input
                              type="text"
                              value={variable.label}
                              onChange={(e) => updateVariable(variable.id, { label: e.target.value })}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="Display Name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                            <select
                              value={variable.type}
                              onChange={(e) => updateVariable(variable.id, { type: e.target.value as any })}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="select">Select</option>
                              <option value="date">Date</option>
                              <option value="file">File</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={variable.description || ''}
                            onChange={(e) => updateVariable(variable.id, { description: e.target.value })}
                            className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            placeholder="Optional description or help text"
                          />
                        </div>

                        <div className="mt-4 flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={variable.required}
                              onChange={(e) => updateVariable(variable.id, { required: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Required</span>
                          </label>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Template Preview</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-2 rounded-md transition-colors ${
                          previewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewMode('tablet')}
                        className={`p-2 rounded-md transition-colors ${
                          previewMode === 'tablet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-2 rounded-md transition-colors ${
                          previewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`mx-auto border border-gray-300 rounded-lg overflow-hidden ${
                  previewMode === 'mobile' ? 'max-w-sm' : 
                  previewMode === 'tablet' ? 'max-w-2xl' : 
                  'max-w-4xl'
                }`}>
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPreviewIcon()}
                      <span className="text-sm font-medium text-gray-700 capitalize">{previewMode} Preview</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{template.title}</h2>
                        <p className="text-gray-600 mt-1">{template.description}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {template.estimatedTime} min
                        </span>
                        <span className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          {template.difficulty}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {typeof template.category === 'string' 
                            ? template.category 
                            : template.category && typeof template.category === 'object' && 'name' in template.category
                              ? (template.category as { name: string }).name
                              : 'Uncategorized'
                          }
                        </span>
                      </div>

                      {template.variables.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h3 className="font-medium text-gray-900 mb-3">Template Variables</h3>
                          <div className="space-y-3">
                            {template.variables.slice(0, 3).map((variable) => (
                              <div key={variable.id} className="flex items-center space-x-3">
                                <Code className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">{variable.label}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  {variable.type}
                                </span>
                                {variable.required && (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                            ))}
                            {template.variables.length > 3 && (
                              <p className="text-sm text-gray-500">
                                +{template.variables.length - 3} more variables
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-medium text-gray-900 mb-3">Template Items</h3>
                        {template.items.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No items defined yet</p>
                        ) : (
                          <div className="space-y-2">
                            {template.items.slice(0, 5).map((item, index) => (
                              <div key={item.id} className="flex items-center space-x-3">
                                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                                <span className="text-sm text-gray-700">{item.text}</span>
                                {item.required && (
                                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                            ))}
                            {template.items.length > 5 && (
                              <p className="text-sm text-gray-500">
                                +{template.items.length - 5} more items
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FeatureGate>
  );
};

// Helper functions (simplified for demo)
async function getBaseTemplate(templateId: string): Promise<any> {
  // Fetch base template from API
  return {
    id: templateId,
    title: 'Sample Template',
    description: 'A sample template for demonstration',
    category: 'custom',
    items: [],
    estimatedTime: 30,
    difficulty: 'medium',
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user',
    version: '1.0'
  };
}

async function getUserProfile(userId: string): Promise<any> {
  return {
    id: userId,
    role: 'user',
    experience: 'intermediate',
    preferences: {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      stepAnimation: true,
      autoSave: true,
      notifications: {
        email: true,
        browser: true,
        mobile: false,
        desktop: true,
        frequency: 'immediate'
      },
      privacy: {
        shareUsageData: true,
        shareErrorReports: true,
        allowPersonalization: true,
        cookieConsent: true
      }
    },
    accessibility: {
      screenReader: false,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardNavigation: false
    },
    completionHistory: []
  };
}

function getCurrentEnvironment(): any {
  return {
    deviceType: 'desktop',
    browserType: 'chrome',
    operatingSystem: 'windows',
    screenSize: { width: 1920, height: 1080, pixelRatio: 1 },
    connectivity: { type: 'wifi', speed: 'fast', quality: 1 },
    timezone: 'America/New_York',
    language: 'en'
  };
}

async function validateTemplate(template: AdvancedTemplate): Promise<{ isValid: boolean; errors: ValidationError[] }> {
  const errors: ValidationError[] = [];

  if (!template.title.trim()) {
    errors.push({
      variableId: 'title',
      rule: 'required',
      message: 'Template title is required',
      value: template.title,
      severity: 'error'
    });
  }

  if (!template.description.trim()) {
    errors.push({
      variableId: 'description',
      rule: 'required',
      message: 'Template description is required',
      value: template.description,
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

async function saveTemplate(template: AdvancedTemplate): Promise<void> {
  // Save to AWS DynamoDB
  console.log('Saving template:', template.id);
}

export default DynamicTemplateBuilder;
