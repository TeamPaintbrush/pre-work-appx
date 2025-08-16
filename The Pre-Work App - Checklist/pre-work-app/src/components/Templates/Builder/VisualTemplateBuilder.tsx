"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistTemplate, TemplateCategory } from '../../../types';
import { 
  TemplateBuilder, 
  BuilderSection, 
  BuilderItem, 
  ItemType, 
  TemplateMetadata 
} from '../../../types/templates';
import { templateService } from '../../../services/templates/TemplateService';
import { ENHANCED_TEMPLATE_CATEGORIES, CategoryHierarchy } from '../../../data/templates/industryCategories';
import Button from '../../UI/Button';
import Modal from '../../UI/Modal';

interface VisualTemplateBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (template: ChecklistTemplate) => void;
  editingTemplate?: ChecklistTemplate;
  userRole?: 'manager' | 'admin';
}

interface BuilderState {
  template: TemplateBuilder;
  activeSection: string | null;
  activeItem: string | null;
  draggedItem: BuilderItem | null;
  validationErrors: string[];
}

const VisualTemplateBuilder: React.FC<VisualTemplateBuilderProps> = ({
  isOpen,
  onClose,
  onTemplateCreated,
  editingTemplate,
  userRole = 'manager'
}) => {
  const [mounted, setMounted] = useState(false);
  const [builderState, setBuilderState] = useState<BuilderState>({
    template: createEmptyTemplate(),
    activeSection: null,
    activeItem: null,
    draggedItem: null,
    validationErrors: []
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize template if editing
  useEffect(() => {
    if (!mounted) return;
    
    if (editingTemplate && isOpen) {
      setBuilderState(prev => ({
        ...prev,
        template: convertToBuilder(editingTemplate)
      }));
    } else if (isOpen) {
      setBuilderState(prev => ({
        ...prev,
        template: createEmptyTemplate()
      }));
    }
  }, [editingTemplate, isOpen, mounted]);

  // Auto-save functionality
  useEffect(() => {
    if (!mounted || !isOpen || !builderState.template.name) return;

    const autoSaveTimer = setTimeout(() => {
      saveTemplate(true); // Draft save
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [builderState.template, isOpen, mounted]);

  function createEmptyTemplate(): TemplateBuilder {
    const timestamp = Math.random().toString(36).substr(2, 9);
    return {
      id: `template-${timestamp}`,
      name: '',
      description: '',
      category: ENHANCED_TEMPLATE_CATEGORIES[0],
      sections: [],
      metadata: {
        estimatedDuration: 60,
        difficulty: 'medium',
        requiredSkills: [],
        tags: [],
        industry: [],
        compliance: [],
        resources: []
      },
      settings: {
        allowCustomItems: true,
        allowSkipping: false,
        requireSignature: false,
        requirePhotos: false,
        enableTimeTracking: true,
        enableGeolocation: false,
        autoSave: true,
        notifications: {
          onCompletion: true,
          onOverdue: true,
          onError: true,
          emailRecipients: []
        }
      },
      isDraft: true,
      lastSaved: new Date()
    };
  }

  function convertToBuilder(template: ChecklistTemplate): TemplateBuilder {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      sections: template.sections.map(section => ({
        id: section.id,
        title: section.title,
        description: section.description,
        isOptional: section.isOptional,
        order: section.order,
        items: section.items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          isRequired: item.isRequired,
          order: item.order,
          type: 'checkbox' as ItemType,
          properties: {
            requiresPhoto: item.requiresPhoto,
            requiresNotes: item.requiresNotes,
            estimatedTime: item.estimatedTime,
            instructions: item.instructions,
            warningMessage: item.warningMessage,
            dependencies: item.dependencies,
            tags: item.tags
          }
        }))
      })),
      metadata: {
        estimatedDuration: template.estimatedDuration || 60,
        difficulty: template.difficulty || 'medium',
        requiredSkills: template.requiredSkills || [],
        tags: template.tags,
        industry: [],
        compliance: [],
        resources: []
      },
      settings: {
        allowCustomItems: true,
        allowSkipping: false,
        requireSignature: false,
        requirePhotos: false,
        enableTimeTracking: true,
        enableGeolocation: false,
        autoSave: true,
        notifications: {
          onCompletion: true,
          onOverdue: true,
          onError: true,
          emailRecipients: []
        }
      },
      isDraft: false,
      lastSaved: new Date()
    };
  }

  const updateTemplate = useCallback((updates: Partial<TemplateBuilder>) => {
    setBuilderState(prev => ({
      ...prev,
      template: { ...prev.template, ...updates, lastSaved: new Date() }
    }));
  }, []);

  const addSection = useCallback(() => {
    const timestamp = Math.random().toString(36).substr(2, 9);
    const newSection: BuilderSection = {
      id: `section-${timestamp}`,
      title: 'New Section',
      description: '',
      isOptional: false,
      order: builderState.template.sections.length,
      items: []
    };

    updateTemplate({
      sections: [...builderState.template.sections, newSection]
    });

    setBuilderState(prev => ({
      ...prev,
      activeSection: newSection.id
    }));
  }, [builderState.template.sections, updateTemplate]);

  const updateSection = useCallback((sectionId: string, updates: Partial<BuilderSection>) => {
    const sections = builderState.template.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    updateTemplate({ sections });
  }, [builderState.template.sections, updateTemplate]);

  const deleteSection = useCallback((sectionId: string) => {
    const sections = builderState.template.sections.filter(s => s.id !== sectionId);
    updateTemplate({ sections });

    if (builderState.activeSection === sectionId) {
      setBuilderState(prev => ({ ...prev, activeSection: null }));
    }
  }, [builderState.template.sections, builderState.activeSection, updateTemplate]);

  const addItem = useCallback((sectionId: string, itemType: ItemType = 'checkbox') => {
    const sections = builderState.template.sections.map(section => {
      if (section.id === sectionId) {
        const timestamp = Math.random().toString(36).substr(2, 9);
        const newItem: BuilderItem = {
          id: `item-${timestamp}`,
          title: 'New Item',
          description: '',
          isRequired: false,
          order: section.items.length,
          type: itemType,
          properties: {
            requiresPhoto: itemType === 'photo',
            requiresNotes: itemType === 'notes',
            tags: []
          }
        };

        return {
          ...section,
          items: [...section.items, newItem]
        };
      }
      return section;
    });

    updateTemplate({ sections });
  }, [builderState.template.sections, updateTemplate]);

  const updateItem = useCallback((sectionId: string, itemId: string, updates: Partial<BuilderItem>) => {
    const sections = builderState.template.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        };
      }
      return section;
    });

    updateTemplate({ sections });
  }, [builderState.template.sections, updateTemplate]);

  const deleteItem = useCallback((sectionId: string, itemId: string) => {
    const sections = builderState.template.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    });

    updateTemplate({ sections });

    if (builderState.activeItem === itemId) {
      setBuilderState(prev => ({ ...prev, activeItem: null }));
    }
  }, [builderState.template.sections, builderState.activeItem, updateTemplate]);

  const saveTemplate = useCallback(async (isDraft = false) => {
    setSaving(true);
    try {
      const template: ChecklistTemplate = {
        id: builderState.template.id,
        name: builderState.template.name,
        description: builderState.template.description,
        category: builderState.template.category,
        version: editingTemplate ? editingTemplate.version : '1.0.0',
        tags: builderState.template.metadata.tags,
        isBuiltIn: false,
        createdBy: 'current-user', // TODO: Get from auth context
        createdAt: editingTemplate?.createdAt || new Date(),
        lastModified: new Date(),
        sections: builderState.template.sections.map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          isOptional: section.isOptional,
          order: section.order,
          items: section.items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            isRequired: item.isRequired,
            isOptional: !item.isRequired,
            order: item.order,
            estimatedTime: item.properties.estimatedTime,
            requiresPhoto: item.properties.requiresPhoto || false,
            requiresNotes: item.properties.requiresNotes || false,
            tags: item.properties.tags || [],
            instructions: item.properties.instructions,
            warningMessage: item.properties.warningMessage,
            dependencies: item.properties.dependencies
          }))
        })),
        estimatedDuration: builderState.template.metadata.estimatedDuration,
        difficulty: builderState.template.metadata.difficulty,
        requiredSkills: builderState.template.metadata.requiredSkills
      };

      let savedTemplate: ChecklistTemplate;
      if (editingTemplate) {
        savedTemplate = await templateService.updateTemplate(editingTemplate.id, template);
      } else {
        savedTemplate = await templateService.createTemplate(template);
      }

      if (!isDraft) {
        onTemplateCreated(savedTemplate);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      // TODO: Show error notification
    } finally {
      setSaving(false);
    }
  }, [builderState.template, editingTemplate, onTemplateCreated, onClose]);

  const validateTemplate = useCallback((): string[] => {
    const errors: string[] = [];

    if (!builderState.template.name.trim()) {
      errors.push('Template name is required');
    }

    if (!builderState.template.description.trim()) {
      errors.push('Template description is required');
    }

    if (builderState.template.sections.length === 0) {
      errors.push('At least one section is required');
    }

    builderState.template.sections.forEach((section, sectionIndex) => {
      if (!section.title.trim()) {
        errors.push(`Section ${sectionIndex + 1} name is required`);
      }

      if (section.items.length === 0) {
        errors.push(`Section "${section.title}" must have at least one item`);
      }

      section.items.forEach((item, itemIndex) => {
        if (!item.title.trim()) {
          errors.push(`Item ${itemIndex + 1} in section "${section.title}" name is required`);
        }
      });
    });

    return errors;
  }, [builderState.template]);

  const handleSave = useCallback(async () => {
    const errors = validateTemplate();
    if (errors.length > 0) {
      setBuilderState(prev => ({ ...prev, validationErrors: errors }));
      return;
    }

    setBuilderState(prev => ({ ...prev, validationErrors: [] }));
    await saveTemplate(false);
  }, [validateTemplate, saveTemplate]);

  if (!isOpen || !mounted) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingTemplate ? 'Edit Template' : 'Create Template'}
      className="max-w-7xl"
    >
      <div className="flex h-[90vh] bg-white">
        {/* Left Sidebar - Template Properties */}
        <div className="w-96 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Template Properties</h2>
              <p className="text-sm text-gray-600">
                Configure your template settings and metadata
              </p>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={builderState.template.name}
                    onChange={(e) => updateTemplate({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={builderState.template.description}
                    onChange={(e) => updateTemplate({ description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe the template purpose and usage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={builderState.template.category.id}
                    onChange={(e) => {
                      const category = ENHANCED_TEMPLATE_CATEGORIES.find(cat => cat.id === e.target.value);
                      if (category) {
                        updateTemplate({ category });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CategoryHierarchy.getMainCategories().map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Template Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Template Metadata</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={builderState.template.metadata.difficulty}
                    onChange={(e) => updateTemplate({
                      metadata: {
                        ...builderState.template.metadata,
                        difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={builderState.template.metadata.estimatedDuration}
                    onChange={(e) => updateTemplate({
                      metadata: {
                        ...builderState.template.metadata,
                        estimatedDuration: parseInt(e.target.value) || 60
                      }
                    })}
                    min="1"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="60"
                  />
                </div>
              </div>
            </div>

            {/* Template Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Template Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure template behavior and requirements
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="allow-custom-items"
                    checked={builderState.template.settings.allowCustomItems}
                    onChange={(e) => updateTemplate({
                      settings: {
                        ...builderState.template.settings,
                        allowCustomItems: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <label htmlFor="allow-custom-items" className="block text-sm font-medium text-gray-700">
                      Allow custom items
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Users can add their own checklist items beyond the template
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="require-photos"
                    checked={builderState.template.settings.requirePhotos}
                    onChange={(e) => updateTemplate({
                      settings: {
                        ...builderState.template.settings,
                        requirePhotos: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <label htmlFor="require-photos" className="block text-sm font-medium text-gray-700">
                      Require photos
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Force photo capture for all checklist items
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="enable-time-tracking"
                    checked={builderState.template.settings.enableTimeTracking}
                    onChange={(e) => updateTemplate({
                      settings: {
                        ...builderState.template.settings,
                        enableTimeTracking: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <label htmlFor="enable-time-tracking" className="block text-sm font-medium text-gray-700">
                      Enable time tracking
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Track time spent on each task and section
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="require-signature"
                    checked={builderState.template.settings.requireSignature}
                    onChange={(e) => updateTemplate({
                      settings: {
                        ...builderState.template.settings,
                        requireSignature: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <label htmlFor="require-signature" className="block text-sm font-medium text-gray-700">
                      Require signature
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Digital signature required for template completion
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {builderState.validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h4>
                    <ul className="mt-2 text-sm text-red-700 space-y-1">
                      {builderState.validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Builder Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setPreviewMode(!previewMode)}
                  variant="secondary"
                  size="sm"
                >
                  {previewMode ? '📝 Edit' : '👁️ Preview'}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => saveTemplate(true)}
                variant="secondary"
                size="sm"
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save Draft'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={saving || builderState.template.sections.length === 0}
              >
                {saving ? 'Creating...' : (editingTemplate ? 'Update Template' : 'Create Template')}
              </Button>
            </div>
          </div>

          {/* Builder Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {previewMode ? (
              <TemplatePreview template={builderState.template} />
            ) : (
              <TemplateEditor
                template={builderState.template}
                activeSection={builderState.activeSection}
                activeItem={builderState.activeItem}
                onActivateSection={(sectionId) => 
                  setBuilderState(prev => ({ ...prev, activeSection: sectionId }))
                }
                onActivateItem={(itemId) => 
                  setBuilderState(prev => ({ ...prev, activeItem: itemId }))
                }
                onAddSection={addSection}
                onUpdateSection={updateSection}
                onDeleteSection={deleteSection}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Template Editor Component
interface TemplateEditorProps {
  template: TemplateBuilder;
  activeSection: string | null;
  activeItem: string | null;
  onActivateSection: (sectionId: string) => void;
  onActivateItem: (itemId: string) => void;
  onAddSection: () => void;
  onUpdateSection: (sectionId: string, updates: Partial<BuilderSection>) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddItem: (sectionId: string, itemType?: ItemType) => void;
  onUpdateItem: (sectionId: string, itemId: string, updates: Partial<BuilderItem>) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  activeSection,
  activeItem,
  onActivateSection,
  onActivateItem,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const itemTypes: { type: ItemType; label: string; icon: string }[] = [
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'photo', label: 'Photo', icon: '📷' },
    { type: 'notes', label: 'Notes', icon: '📄' },
    { type: 'measurement', label: 'Measurement', icon: '📏' },
    { type: 'timer', label: 'Timer', icon: '⏱️' },
    { type: 'signature', label: 'Signature', icon: '✍️' },
    { type: 'location', label: 'Location', icon: '📍' }
  ];

  return (
    <div className="space-y-6">
      {/* Empty State */}
      {template.sections.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Start building your template
          </h3>
          <p className="text-gray-500 mb-6">
            Add sections to organize your checklist items
          </p>
          <Button onClick={onAddSection}>
            ➕ Add First Section
          </Button>
        </div>
      )}

      {/* Sections */}
      {template.sections.map((section, sectionIndex) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-lg p-4 ${
            activeSection === section.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white'
          }`}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {sectionIndex + 1}
              </div>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
                  onClick={() => onActivateSection(section.id)}
                  className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                  placeholder="Section name"
                />
                <input
                  type="text"
                  value={section.description}
                  onChange={(e) => onUpdateSection(section.id, { description: e.target.value })}
                  onClick={() => onActivateSection(section.id)}
                  className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 w-full mt-1"
                  placeholder="Section description"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={section.isOptional}
                  onChange={(e) => onUpdateSection(section.id, { isOptional: e.target.checked })}
                  className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Optional
              </label>
              
              <Button
                onClick={() => onDeleteSection(section.id)}
                variant="secondary"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                🗑️
              </Button>
            </div>
          </div>

          {/* Section Items */}
          <div className="space-y-2 ml-11">
            {section.items.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center space-x-3 p-3 rounded border ${
                  activeItem === item.id 
                    ? 'border-blue-300 bg-blue-25' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 rounded text-xs">
                  {itemIndex + 1}
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={item.type}
                    onChange={(e) => onUpdateItem(section.id, item.id, { type: e.target.value as ItemType })}
                    className="text-sm border-gray-300 rounded focus:ring-blue-500"
                  >
                    {itemTypes.map(({ type, label, icon }) => (
                      <option key={type} value={type}>
                        {icon} {label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => onUpdateItem(section.id, item.id, { title: e.target.value })}
                  onClick={() => onActivateItem(item.id)}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0"
                  placeholder="Item name"
                />

                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={item.isRequired}
                    onChange={(e) => onUpdateItem(section.id, item.id, { isRequired: e.target.checked })}
                    className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Required
                </label>

                <Button
                  onClick={() => onDeleteItem(section.id, item.id)}
                  variant="secondary"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </Button>
              </motion.div>
            ))}

            {/* Add Item Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {itemTypes.slice(0, 4).map(({ type, label, icon }) => (
                <Button
                  key={type}
                  onClick={() => onAddItem(section.id, type)}
                  variant="secondary"
                  size="sm"
                >
                  {icon} Add {label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Add Section Button */}
      {template.sections.length > 0 && (
        <div className="text-center">
          <Button onClick={onAddSection} variant="secondary">
            ➕ Add Section
          </Button>
        </div>
      )}
    </div>
  );
};

// Template Preview Component
const TemplatePreview: React.FC<{ template: TemplateBuilder }> = ({ template }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h2>
          <p className="text-gray-600 mb-4">{template.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>📂 {template.category.name}</span>
            <span>⏱️ {template.metadata.estimatedDuration} min</span>
            <span>📊 {template.metadata.difficulty}</span>
            <span>📝 {template.sections.reduce((total, section) => total + section.items.length, 0)} items</span>
          </div>
        </div>

        <div className="space-y-6">
          {template.sections.map((section, sectionIndex) => (
            <div key={section.id} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {sectionIndex + 1}. {section.title}
                {section.isOptional && <span className="text-sm text-gray-500 ml-2">(Optional)</span>}
              </h3>
              {section.description && (
                <p className="text-gray-600 mb-3">{section.description}</p>
              )}
              
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 w-6">
                        {sectionIndex + 1}.{itemIndex + 1}
                      </span>
                      <div className="w-4 h-4 border border-gray-300 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-900">{item.title}</span>
                      {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualTemplateBuilder;
