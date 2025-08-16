"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistTemplate, TemplateCategory } from '../../types';
import { TEMPLATE_CATEGORIES, PRESET_TEMPLATES } from '../../data/presetChecklists';
import { ENHANCED_TEMPLATE_CATEGORIES, INDUSTRY_TEMPLATES, CategoryHierarchy } from '../../data/templates/industryCategories';
import { templateService } from '../../services/templates/TemplateService';
import TemplateCategoryCard from './TemplateCategoryCard';
import TemplateCard from './TemplateCard';
import VisualTemplateBuilder from './Builder/VisualTemplateBuilder';
import TemplateVersionManager from './Versioning/TemplateVersionManager';
import TemplateSharingManager from './Sharing/TemplateSharingManager';
import Button from '../UI/Button';

interface AdvancedTemplateGalleryProps {
  onSelectTemplate: (template: ChecklistTemplate) => void;
  userRole?: 'worker' | 'manager' | 'admin';
  className?: string;
  recentTemplates?: string[];
  favoriteTemplates?: string[];
  onMarkFavorite?: (templateId: string) => void;
}

interface FilterState {
  search: string;
  category: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  duration: 'all' | 'short' | 'medium' | 'long'; // <60min, 60-180min, >180min
  tags: string[];
  sortBy: 'name' | 'duration' | 'difficulty' | 'recent' | 'popularity' | 'rating';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'industry';
}

interface TemplateModalState {
  showCreateModal: boolean;
  showVisualBuilder: boolean;
  showVersionManager: boolean;
  showSharingManager: boolean;
  selectedTemplate: ChecklistTemplate | null;
}

const AdvancedTemplateGallery: React.FC<AdvancedTemplateGalleryProps> = ({
  onSelectTemplate,
  userRole = 'worker',
  className = '',
  recentTemplates = [],
  favoriteTemplates = [],
  onMarkFavorite
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ChecklistTemplate[]>([]);
  
  const [modalState, setModalState] = useState<TemplateModalState>({
    showCreateModal: false,
    showVisualBuilder: false,
    showVersionManager: false,
    showSharingManager: false,
    selectedTemplate: null
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    difficulty: 'all',
    duration: 'all',
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'grid'
  });

  // Prevent hydration mismatch by ensuring client-side mounting
  useEffect(() => {
    setMounted(true);
    loadCustomTemplates();
  }, []);

  // Load custom templates from service
  const loadCustomTemplates = useCallback(async () => {
    try {
      const templates = templateService.getAllTemplates();
      setCustomTemplates(templates.filter(t => !t.isBuiltIn));
    } catch (error) {
      console.error('Failed to load custom templates:', error);
    }
  }, []);

  const canCreateTemplates = userRole === 'manager' || userRole === 'admin';

  // Combine built-in and custom templates
  const allTemplates = useMemo(() => {
    return [...PRESET_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  // Get all unique tags from templates
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allTemplates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allTemplates]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let templates = selectedCategory 
      ? allTemplates.filter(template => template.category.id === selectedCategory.id)
      : allTemplates;

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        template.requiredSkills?.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      templates = templates.filter(template => template.difficulty === filters.difficulty);
    }

    // Apply duration filter
    if (filters.duration !== 'all') {
      templates = templates.filter(template => {
        const duration = template.estimatedDuration || 60;
        switch (filters.duration) {
          case 'short': return duration < 60;
          case 'medium': return duration >= 60 && duration <= 180;
          case 'long': return duration > 180;
          default: return true;
        }
      });
    }

    // Apply tag filters
    if (filters.tags.length > 0) {
      templates = templates.filter(template =>
        filters.tags.every(tag => template.tags.includes(tag))
      );
    }

    // Sort templates
    templates.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'duration':
          comparison = (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          comparison = difficultyOrder[a.difficulty || 'medium'] - difficultyOrder[b.difficulty || 'medium'];
          break;
        case 'recent':
          comparison = new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
          break;
        case 'popularity':
          // Mock popularity score based on category and built-in status
          const aPopularity = (a.isBuiltIn ? 10 : 5) + (recentTemplates.includes(a.id) ? 5 : 0);
          const bPopularity = (b.isBuiltIn ? 10 : 5) + (recentTemplates.includes(b.id) ? 5 : 0);
          comparison = bPopularity - aPopularity;
          break;
        case 'rating':
          // Only calculate ratings on client side to avoid hydration issues
          if (!mounted) {
            comparison = 0;
          } else {
            // Use deterministic rating based on template ID to avoid hydration issues
            const aHash = a.id.split('').reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
            const bHash = b.id.split('').reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
            const aRating = 4.5 + (Math.abs(aHash) % 50) / 100; // 4.5-5.0 rating
            const bRating = 4.5 + (Math.abs(bHash) % 50) / 100; // 4.5-5.0 rating
            comparison = bRating - aRating;
          }
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return templates;
  }, [selectedCategory, filters, recentTemplates, mounted]);

  // Quick search suggestions
  const searchSuggestions = useMemo(() => {
    if (!filters.search.trim()) return [];
    
    const searchTerm = filters.search.toLowerCase();
    const suggestions = new Set<string>();
    
    // Add matching template names
    PRESET_TEMPLATES.forEach(template => {
      if (template.name.toLowerCase().includes(searchTerm)) {
        suggestions.add(template.name);
      }
      template.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }, [filters.search]);

  const handleCategorySelect = (category: TemplateCategory) => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, category: category.id }));
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setFilters(prev => ({ ...prev, search: '', category: 'all', tags: [] }));
  };

  const handleCreateTemplate = (template: ChecklistTemplate) => {
    console.log('Creating template:', template);
    setModalState(prev => ({ ...prev, showCreateModal: false }));
    loadCustomTemplates(); // Refresh custom templates
  };

  const handleDeleteTemplate = async (template: ChecklistTemplate) => {
    if (template.isBuiltIn) return; // Can't delete built-in templates
    
    if (window.confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      try {
        await templateService.deleteTemplate(template.id);
        await loadCustomTemplates(); // Refresh the template list
      } catch (error) {
        console.error('Failed to delete template:', error);
        // TODO: Show error notification
      }
    }
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: '',
      difficulty: 'all',
      duration: 'all',
      tags: [],
      sortBy: 'name',
      sortOrder: 'asc'
    }));
  };

  // Add industry view rendering
  const renderIndustryView = () => {
    return (
      <div className="space-y-8">
        {INDUSTRY_TEMPLATES.map((industry) => (
          <motion.div
            key={industry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: industry.color + '20' }}
                >
                  {industry.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {industry.industryName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {industry.description}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {industry.totalTemplates} templates
              </div>
            </div>

            {/* Industry Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTemplates
                .filter(template => 
                  industry.subcategories?.some(sub => 
                    CategoryHierarchy.getCategoryPath(template.category.id).some(cat => 
                      cat.id === sub.id
                    )
                  ) || 
                  CategoryHierarchy.getCategoryPath(template.category.id).some(cat => 
                    cat.name.toLowerCase().includes(industry.industryName.toLowerCase())
                  )
                )
                .slice(0, 6) // Show first 6 templates
                .map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => onSelectTemplate(template)}
                    userRole={userRole}
                    showManagementActions={canCreateTemplates}
                    onEdit={(template) => setModalState(prev => ({ 
                      ...prev, 
                      selectedTemplate: template, 
                      showVisualBuilder: true 
                    }))}
                    onVersion={(template) => setModalState(prev => ({ 
                      ...prev, 
                      selectedTemplate: template, 
                      showVersionManager: true 
                    }))}
                    onShare={(template) => setModalState(prev => ({ 
                      ...prev, 
                      selectedTemplate: template, 
                      showSharingManager: true 
                    }))}
                    onDelete={(template) => handleDeleteTemplate(template)}
                    onFavorite={(template) => onMarkFavorite?.(template.id)}
                    isFavorite={favoriteTemplates.includes(template.id)}
                    className="transform hover:scale-105 transition-transform"
                  />
                ))}
            </div>

            {/* Show More Button */}
            {allTemplates.filter(template => 
              industry.subcategories?.some(sub => 
                CategoryHierarchy.getCategoryPath(template.category.id).some(cat => 
                  cat.id === sub.id
                )
              )
            ).length > 6 && (
              <div className="text-center mt-4">
                <Button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, viewMode: 'grid' }));
                  }}
                  variant="secondary"
                  size="sm"
                >
                  View All {industry.industryName} Templates
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const getDurationLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderSearchAndFilters = () => (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates, tags, or skills..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setFilters(prev => ({ ...prev, search: suggestion }))}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <span>🔧</span>
          <span>Filters</span>
          {showFilters ? <span>▲</span> : <span>▼</span>}
        </Button>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
              className={`px-3 py-2 text-sm ${
                filters.viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
              className={`px-3 py-2 text-sm ${
                filters.viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="List View"
            >
              ☰
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, viewMode: 'industry' }))}
              className={`px-3 py-2 text-sm ${
                filters.viewMode === 'industry' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Industry View"
            >
              🏢
            </button>
          </div>

          {/* Results Count */}
          <span className="text-sm text-gray-600">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Durations</option>
                  <option value="short">Short (&lt; 1 hour)</option>
                  <option value="medium">Medium (1-3 hours)</option>
                  <option value="long">Long (&gt; 3 hours)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="duration">Duration</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="recent">Recently Modified</option>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {/* Tag Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 15).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderTemplateList = () => (
    <div className="space-y-4">
      {filteredTemplates.map((template) => (
        <motion.div
          key={template.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectTemplate(template)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                {template.isBuiltIn && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Built-in
                  </span>
                )}
                {favoriteTemplates.includes(template.id) && (
                  <span className="text-yellow-500">⭐</span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3">{template.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <span>⏱️</span>
                  <span>{getDurationLabel(template.estimatedDuration || 60)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>📋</span>
                  <span>{template.sections.reduce((total, section) => total + section.items.length, 0)} items</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  template.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {template.difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {onMarkFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkFavorite(template.id);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    favoriteTemplates.includes(template.id)
                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  ⭐
                </button>
              )}
              <Button variant="outline" size="sm">
                Use Template
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {template.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{template.tags.length - 4} more
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={`advanced-template-gallery ${className}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Template Gallery</h1>
          <p className="text-gray-600 mt-2">Loading templates...</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`advanced-template-gallery ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCategory ? selectedCategory.name : 'Template Gallery'}
            </h1>
            <p className="text-gray-600 mt-2">
              {selectedCategory 
                ? selectedCategory.description
                : 'Discover professional templates for every industry and use case'
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

        {/* Quick Actions */}
        {!selectedCategory && (
          <div className="flex items-center space-x-4 mb-6">
            {recentTemplates.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>🕒</span>
                <span>Recently Used:</span>
                <div className="flex space-x-2">
                  {recentTemplates.slice(0, 3).map((templateId) => {
                    const template = PRESET_TEMPLATES.find(t => t.id === templateId);
                    return template ? (
                      <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200"
                      >
                        {template.name}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filters */}
        {selectedCategory && renderSearchAndFilters()}
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
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Create Custom Templates
                    </h3>
                    <p className="text-gray-600">
                      Build your own templates tailored to your specific needs and workflows.
                    </p>
                  </div>
                  <Button
                    onClick={() => setModalState(prev => ({ ...prev, showVisualBuilder: true }))}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>+</span> Create Template
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          // Templates View
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or explore other categories
                </p>
                <div className="flex justify-center space-x-3">
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                  <Button onClick={handleBackToCategories}>
                    Browse Categories
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {filters.viewMode === 'industry' ? (
                  renderIndustryView()
                ) : filters.viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onClick={() => onSelectTemplate(template)}
                        userRole={userRole}
                        showManagementActions={canCreateTemplates}
                        onEdit={(template) => setModalState(prev => ({ 
                          ...prev, 
                          selectedTemplate: template, 
                          showVisualBuilder: true 
                        }))}
                        onVersion={(template) => setModalState(prev => ({ 
                          ...prev, 
                          selectedTemplate: template, 
                          showVersionManager: true 
                        }))}
                        onShare={(template) => setModalState(prev => ({ 
                          ...prev, 
                          selectedTemplate: template, 
                          showSharingManager: true 
                        }))}
                        onDelete={(template) => handleDeleteTemplate(template)}
                        onFavorite={(template) => onMarkFavorite?.(template.id)}
                        isFavorite={favoriteTemplates.includes(template.id)}
                      />
                    ))}
                  </div>
                ) : (
                  renderTemplateList()
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Template Management Modals */}
      <VisualTemplateBuilder
        isOpen={modalState.showCreateModal || modalState.showVisualBuilder}
        onClose={() => setModalState(prev => ({ 
          ...prev, 
          showCreateModal: false, 
          showVisualBuilder: false,
          selectedTemplate: null 
        }))}
        onTemplateCreated={handleCreateTemplate}
        editingTemplate={modalState.selectedTemplate || undefined}
        userRole={userRole === 'worker' ? 'manager' : userRole}
      />

      {modalState.selectedTemplate && (
        <>
          <TemplateVersionManager
            template={modalState.selectedTemplate}
            isOpen={modalState.showVersionManager}
            onClose={() => setModalState(prev => ({ ...prev, showVersionManager: false }))}
            userRole={userRole === 'worker' ? 'manager' : userRole}
          />

          <TemplateSharingManager
            template={modalState.selectedTemplate}
            isOpen={modalState.showSharingManager}
            onClose={() => setModalState(prev => ({ ...prev, showSharingManager: false }))}
            userRole={userRole === 'worker' ? 'manager' : userRole}
          />
        </>
      )}
    </div>
  );
};

export default AdvancedTemplateGallery;
