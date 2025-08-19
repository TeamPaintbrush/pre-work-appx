'use client';

import React, { useState, useEffect } from 'react';
import { ChecklistTemplate, UserRole } from '../../types';
import { ALL_EXPANDED_TEMPLATES, TEMPLATE_CATEGORIES_MAP } from '../../data/templates/categories';
import { Search, Grid3X3, Star, Clock, Users, ArrowLeft } from 'lucide-react';
import TemplateCategoryCard from './TemplateCategoryCard';

interface TemplateGalleryProps {
  workspaceId?: string;
  userId?: string;
  userRole?: UserRole;
  onTemplateSelect?: (template: ChecklistTemplate) => void;
  onMarkFavorite?: (templateId: string) => void;
  favoriteTemplates?: string[];
}

export default function TemplateGallery({
  workspaceId = 'default',
  userId = 'guest',
  userRole = 'viewer',
  onTemplateSelect,
  onMarkFavorite,
  favoriteTemplates = []
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ChecklistTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'recent'>('name');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'templates'>('categories');

  // Ensure client-side rendering for hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates when search term, category, or templates change
  useEffect(() => {
    if (viewMode === 'templates') {
      filterTemplates();
    }
  }, [templates, searchTerm, selectedCategory, sortBy, viewMode]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Use our static template data
      setTemplates(ALL_EXPANDED_TEMPLATES);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Filter by selected category when in templates view
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category?.id === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return (a.category?.name || '').localeCompare(b.category?.name || '');
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode('templates');
    setSearchTerm(''); // Clear search when entering category
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
    setSearchTerm('');
  };

  const handleTemplateClick = (template: ChecklistTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleFavoriteClick = (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onMarkFavorite) {
      onMarkFavorite(templateId);
    }
  };

  const getTemplateStats = (template: ChecklistTemplate) => {
    const totalItems = template.sections.reduce((sum, section) => sum + section.items.length, 0);
    const estimatedTime = Math.ceil(totalItems * 2); // 2 minutes per item estimate
    return { totalItems, estimatedTime };
  };

  if (isLoading || !isClient) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-blue-600" />
            Template Gallery
          </h2>
          <p className="text-gray-600 mt-1">
            {viewMode === 'categories' 
              ? `${Object.keys(TEMPLATE_CATEGORIES_MAP).length} template categories`
              : `${filteredTemplates.length} templates in ${selectedCategory && selectedCategory in TEMPLATE_CATEGORIES_MAP ? TEMPLATE_CATEGORIES_MAP[selectedCategory as keyof typeof TEMPLATE_CATEGORIES_MAP].name : 'category'}`
            }
          </p>
        </div>
        
        {/* Back to Categories Button */}
        {viewMode === 'templates' && (
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </button>
        )}
      </div>

      {/* Search and Filters - Only show when in templates view */}
      {viewMode === 'templates' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'recent')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      )}

      {/* Content */}
      {viewMode === 'categories' ? (
        // Category Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(TEMPLATE_CATEGORIES_MAP).map(([categoryId, categoryInfo]) => {
            const categoryTemplates = templates.filter(
              template => template.category?.id === categoryId
            );
            
            return (
              <TemplateCategoryCard
                key={categoryId}
                category={{
                  id: categoryId,
                  name: categoryInfo.name,
                  description: categoryInfo.description,
                  icon: categoryInfo.icon,
                  color: categoryInfo.color,
                  isActive: true
                }}
                templateCount={categoryTemplates.length}
                onClick={() => handleCategoryClick(categoryId)}
              />
            );
          })}
        </div>
      ) : (
        // Templates View
        filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'No templates available in this category'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const { totalItems, estimatedTime } = getTemplateStats(template);
              const isFavorite = favoriteTemplates.includes(template.id);

              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer p-6"
                >
                  {/* Template Content */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {template.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => handleFavoriteClick(template.id, e)}
                      className={`p-1 rounded-full transition-colors ${
                        isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Template Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{totalItems} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>~{estimatedTime}min</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateClick(template);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
