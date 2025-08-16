'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistTemplate, TemplateCategory, TemplateSectionDefinition, TemplateItemDefinition } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: ChecklistTemplate) => void;
  categories: TemplateCategory[];
  editingTemplate?: ChecklistTemplate | null;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingTemplate
}) => {
  const [formData, setFormData] = useState({
    name: editingTemplate?.name || '',
    description: editingTemplate?.description || '',
    categoryId: editingTemplate?.category.id || (categories.length > 0 ? categories[0].id : ''),
    tags: editingTemplate?.tags.join(', ') || '',
    estimatedDuration: editingTemplate?.estimatedDuration || 60,
    difficulty: editingTemplate?.difficulty || 'medium',
    requiredSkills: editingTemplate?.requiredSkills?.join(', ') || ''
  });

  const [sections, setSections] = useState<TemplateSectionDefinition[]>(
    editingTemplate?.sections || [
      {
        id: 'section-1',
        title: 'Section 1',
        description: 'First section',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'item-1',
            title: 'First item',
            description: 'First item description',
            isRequired: true,
            isOptional: false,
            order: 1,
            estimatedTime: 10,
            requiresPhoto: false,
            requiresNotes: false,
            tags: [],
            dependencies: []
          }
        ]
      }
    ]
  );

  const handleSave = () => {
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    if (!selectedCategory) return;

    // Generate a unique ID using timestamp and random string (client-side only)
    const generateId = () => `template-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const template: ChecklistTemplate = {
      id: editingTemplate?.id || generateId(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: selectedCategory,
      version: editingTemplate?.version || '1.0',
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0),
      isBuiltIn: false,
      createdBy: 'current-user',
      createdAt: editingTemplate?.createdAt || new Date(),
      lastModified: new Date(),
      sections: sections,
      estimatedDuration: formData.estimatedDuration,
      difficulty: formData.difficulty as 'easy' | 'medium' | 'hard',
      requiredSkills: formData.requiredSkills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill.length > 0)
    };

    onSave(template);
    onClose();
  };

  const addSection = () => {
    const newSection: TemplateSectionDefinition = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: 'New section description',
      isOptional: false,
      order: sections.length + 1,
      items: []
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSectionDefinition>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const addItem = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newItem: TemplateItemDefinition = {
      id: `item-${Date.now()}`,
      title: `Item ${section.items.length + 1}`,
      description: 'New item description',
      isRequired: true,
      isOptional: false,
      order: section.items.length + 1,
      estimatedTime: 10,
      requiresPhoto: false,
      requiresNotes: false,
      tags: [],
      dependencies: []
    };

    updateSection(sectionId, {
      items: [...section.items, newItem]
    });
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<TemplateItemDefinition>) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedItems = section.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    updateSection(sectionId, { items: updatedItems });
  };

  const deleteItem = (sectionId: string, itemId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedItems = section.items.filter(item => item.id !== itemId);
    updateSection(sectionId, { items: updatedItems });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTemplate ? 'Edit Template' : 'Create New Template'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what this template is for"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 60 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="office, cleaning, daily"
            />
          </div>
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Template Sections</h3>
            <Button onClick={addSection} size="sm">
              Add Section
            </Button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 text-lg"
                    placeholder="Section title"
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => addItem(section.id)}
                      size="xs"
                      variant="outline"
                    >
                      Add Item
                    </Button>
                    <Button
                      onClick={() => deleteSection(section.id)}
                      size="xs"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <textarea
                  value={section.description}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-3"
                  placeholder="Section description"
                />

                {/* Items */}
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })}
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0"
                        placeholder="Item title"
                      />
                      <label className="flex items-center space-x-1 text-xs">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          onChange={(e) => updateItem(section.id, item.id, { isRequired: e.target.checked })}
                        />
                        <span>Required</span>
                      </label>
                      <button
                        onClick={() => deleteItem(section.id, item.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTemplateModal;
