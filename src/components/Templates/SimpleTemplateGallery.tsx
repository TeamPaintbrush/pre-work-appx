'use client';

import React, { useState } from 'react';
import { ChecklistTemplate, TemplateCategory } from '../../types';

// Import template data directly to test
const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'cleaning',
    name: 'Cleaning & Maintenance',
    description: 'Professional cleaning and maintenance templates for various environments',
    icon: '🧹',
    color: '#3B82F6',
    isActive: true
  },
  {
    id: 'inspection',
    name: 'Safety Inspection',
    description: 'Comprehensive safety and inspection checklists for compliance',
    icon: '🔍',
    color: '#10B981',
    isActive: true
  },
  {
    id: 'maintenance',
    name: 'Equipment Maintenance',
    description: 'Equipment maintenance and repair procedures',
    icon: '🔧',
    color: '#F59E0B',
    isActive: true
  }
];

const SAMPLE_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'office-cleaning',
    name: 'Office Deep Clean',
    description: 'Comprehensive office cleaning checklist for commercial spaces',
    category: TEMPLATE_CATEGORIES[0],
    version: '1.0',
    tags: ['office', 'commercial', 'deep-clean'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['Commercial Cleaning', 'Equipment Operation'],
    sections: [
      {
        id: 'prep',
        title: 'Preparation & Setup',
        description: 'Initial preparation and equipment setup',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'supplies-check',
            title: 'Check cleaning supplies inventory',
            description: 'Verify all necessary cleaning supplies are available',
            isRequired: true,
            isOptional: false,
            order: 1,
            estimatedTime: 10,
            requiresPhoto: true,
            requiresNotes: false,
            tags: ['supplies', 'inventory'],
            preConditions: []
          }
        ],
        preConditions: []
      }
    ]
  },
  {
    id: 'restaurant-cleaning',
    name: 'Restaurant Deep Clean',
    description: 'Complete restaurant cleaning and sanitization protocol',
    category: TEMPLATE_CATEGORIES[0],
    version: '1.0',
    tags: ['restaurant', 'food-service', 'sanitization'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 240,
    difficulty: 'hard',
    requiredSkills: ['Food Service Cleaning', 'Health Code Compliance'],
    sections: [
      {
        id: 'kitchen',
        title: 'Kitchen Cleaning',
        description: 'Clean and sanitize kitchen areas',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'equipment-clean',
            title: 'Clean cooking equipment',
            description: 'Deep clean all cooking equipment and surfaces',
            isRequired: true,
            isOptional: false,
            order: 1,
            estimatedTime: 45,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['kitchen', 'equipment'],
            preConditions: []
          }
        ],
        preConditions: []
      }
    ]
  }
];

interface SimpleTemplateGalleryProps {
  onSelectTemplate: (template: ChecklistTemplate) => void;
}

const SimpleTemplateGallery: React.FC<SimpleTemplateGalleryProps> = ({
  onSelectTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);

  const filteredTemplates = selectedCategory 
    ? SAMPLE_TEMPLATES.filter(template => template.category.id === selectedCategory.id)
    : SAMPLE_TEMPLATES;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {selectedCategory ? selectedCategory.name : 'Template Gallery'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedCategory 
            ? selectedCategory.description
            : 'Choose from professional templates or create your own'
          }
        </p>
        
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Back to Categories
          </button>
        )}
      </div>

      {!selectedCategory ? (
        // Category Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mr-4"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {category.icon}
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {SAMPLE_TEMPLATES.filter(t => t.category.id === category.id).length} templates
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Templates Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No templates found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No templates available in this category yet
              </p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                  
                  {template.isBuiltIn && (
                    <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Built-in
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>{template.sections.length} sections</span>
                    <span>{template.sections.reduce((total, section) => total + section.items.length, 0)} items</span>
                  </div>
                  <span>{template.estimatedDuration}m</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    template.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    template.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {template.difficulty}
                  </span>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                    Use Template →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleTemplateGallery;
