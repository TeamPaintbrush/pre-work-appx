'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistTemplate, TemplateCategory } from '../../types';
import { TEMPLATE_CATEGORIES, PRESET_TEMPLATES } from '../../data/presetChecklists';
import TemplateCategoryCard from './TemplateCategoryCard';
import TemplateCard from './TemplateCard';
import CreateTemplateModal from './CreateTemplateModal';
import Button from '../UI/Button';

interface TemplateGalleryProps {
  onSelectTemplate: (template: ChecklistTemplate) => void;
  userRole?: 'worker' | 'manager' | 'admin';
  className?: string;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  userRole = 'worker',
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'difficulty' | 'recent'>('name');

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let templates = selectedCategory 
      ? PRESET_TEMPLATES.filter(template => template.category.id === selectedCategory.id)
      : PRESET_TEMPLATES;

    // Apply search filter
    if (searchQuery) {
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      templates = templates.filter(template => template.difficulty === difficultyFilter);
    }

    // Sort templates
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          return (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty || 'medium'] - difficultyOrder[b.difficulty || 'medium'];
        case 'recent':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        default:
          return 0;
      }
    });

    return templates;
  }, [selectedCategory, searchQuery, difficultyFilter, sortBy]);

  const canCreateTemplates = userRole === 'manager' || userRole === 'admin';

  const handleCategorySelect = (category: TemplateCategory) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleCreateTemplate = (template: ChecklistTemplate) => {
    // Handle template creation logic here
    console.log('Creating template:', template);
    setShowCreateModal(false);
    // You might want to add the template to a custom templates list
    // and then call onSelectTemplate if needed
  };

  return (
    <div className={`template-gallery ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {selectedCategory ? selectedCategory.name : 'Template Gallery'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {selectedCategory 
                ? selectedCategory.description
                : 'Choose from professional templates or create your own'
              }
            </p>
          </div>
          
          {selectedCategory && (
            <Button
              onClick={handleBackToCategories}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <span>←</span> Back to Categories
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        {selectedCategory && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'duration' | 'difficulty' | 'recent')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="duration">Sort by Duration</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          // Category Grid View
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {TEMPLATE_CATEGORIES.filter(cat => cat.isActive).map((category) => (
                <TemplateCategoryCard
                  key={category.id}
                  category={category}
                  templateCount={PRESET_TEMPLATES.filter(t => t.category.id === category.id).length}
                  onClick={() => handleCategorySelect(category)}
                />
              ))}
            </div>

            {/* Custom Templates Section */}
            {canCreateTemplates && (
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Create Custom Templates
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Build your own templates tailored to your specific needs and workflows.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>+</span> Create Template
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          // Templates Grid View
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery ? 'Try adjusting your search or filters' : 'No templates available in this category yet'}
                </p>
                {canCreateTemplates && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create First Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => onSelectTemplate(template)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTemplate}
          categories={TEMPLATE_CATEGORIES}
        />
      )}
    </div>
  );
};

export default TemplateGallery;
