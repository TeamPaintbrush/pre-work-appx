// Enhanced Template Gallery with Advanced Search and Filtering
// Comprehensive search, filtering, sorting, and data visualization

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '../../AdvancedFeatures/FeatureToggleProvider';
import { AdvancedTemplate } from '../../../types/templates/advanced';
import { advancedTemplateService } from '../../../services/templates/AdvancedTemplateService';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Bookmark,
  BookmarkCheck,
  Star,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Award,
  Calendar,
  MapPin,
  Tag,
  Eye,
  Download,
  Share,
  MoreHorizontal,
  ChevronDown,
  X,
  RefreshCw,
  Settings,
  Layers,
  PieChart,
  LineChart,
  ArrowUpRight,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Video,
  Mic,
  Code2,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Accessibility,
  Palette,
  Shield,
  Edit3
} from 'lucide-react';

interface TemplateFilters {
  categories: string[];
  difficulty: string[];
  estimatedTime: { min: number; max: number };
  tags: string[];
  dateRange: { start: Date | null; end: Date | null };
  rating: { min: number; max: number };
  usage: { min: number; max: number };
  deviceTypes: string[];
  languages: string[];
  features: string[];
}

interface SortOption {
  field: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface EnhancedTemplateGalleryProps {
  templates?: AdvancedTemplate[];
  workspaceId: string;
  userId: string;
  onTemplateSelect?: (template: AdvancedTemplate) => void;
  onTemplateEdit?: (template: AdvancedTemplate) => void;
  onTemplatePreview?: (template: AdvancedTemplate) => void;
  className?: string;
}

export const EnhancedTemplateGallery: React.FC<EnhancedTemplateGalleryProps> = ({
  templates: initialTemplates,
  workspaceId,
  userId,
  onTemplateSelect,
  onTemplateEdit,
  onTemplatePreview,
  className = ''
}) => {
  const [templates, setTemplates] = useState<AdvancedTemplate[]>(initialTemplates || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TemplateFilters>({
    categories: [],
    difficulty: [],
    estimatedTime: { min: 0, max: 480 },
    tags: [],
    dateRange: { start: null, end: null },
    rating: { min: 0, max: 5 },
    usage: { min: 0, max: 1000 },
    deviceTypes: [],
    languages: [],
    features: []
  });
  const [sortBy, setSortBy] = useState<SortOption>({
    field: 'updatedAt',
    label: 'Recently Updated',
    direction: 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Load templates and analytics
  useEffect(() => {
    loadTemplates();
    loadBookmarks();
  }, [workspaceId, userId]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Load templates with analytics
      const loadedTemplates = await advancedTemplateService.getTemplatesWithAnalytics(workspaceId);
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const bookmarks = await advancedTemplateService.getUserBookmarks(userId);
      setBookmarkedTemplates(new Set(bookmarks));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  // Advanced filtering and search
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(template =>
        filters.categories.includes(template.category)
      );
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(template =>
        filters.difficulty.includes(template.difficulty)
      );
    }

    // Time range filter
    filtered = filtered.filter(template =>
      template.estimatedTime >= filters.estimatedTime.min &&
      template.estimatedTime <= filters.estimatedTime.max
    );

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(template =>
        filters.tags.some(tag => template.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(template =>
        template.updatedAt >= filters.dateRange.start! &&
        template.updatedAt <= filters.dateRange.end!
      );
    }

    // Rating filter (based on quality metrics)
    filtered = filtered.filter(template => {
      const rating = template.qualityMetrics?.overallScore || 0;
      return rating >= filters.rating.min && rating <= filters.rating.max;
    });

    // Usage filter (based on analytics)
    filtered = filtered.filter(template => {
      const usage = template.analytics?.usageStats?.totalUsage || 0;
      return usage >= filters.usage.min && usage <= filters.usage.max;
    });

    return filtered;
  }, [templates, searchQuery, filters]);

  // Sorting
  const sortedTemplates = useMemo(() => {
    const sorted = [...filteredTemplates];
    
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'estimatedTime':
          aValue = a.estimatedTime;
          bValue = b.estimatedTime;
          break;
        case 'rating':
          aValue = a.qualityMetrics?.overallScore || 0;
          bValue = b.qualityMetrics?.overallScore || 0;
          break;
        case 'usage':
          aValue = a.analytics?.usageStats?.totalUsage || 0;
          bValue = b.analytics?.usageStats?.totalUsage || 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (sortBy.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [filteredTemplates, sortBy]);

  // Pagination
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTemplates.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTemplates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedTemplates.length / itemsPerPage);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (templates.length === 0) return null;

    const totalUsage = templates.reduce((sum, t) => sum + (t.analytics?.usageStats?.totalUsage || 0), 0);
    const averageRating = templates.reduce((sum, t) => sum + (t.qualityMetrics?.overallScore || 0), 0) / templates.length;
    const categoryDistribution = templates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyDistribution = templates.reduce((acc, t) => {
      acc[t.difficulty] = (acc[t.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTemplates: templates.length,
      totalUsage,
      averageRating,
      categoryDistribution,
      difficultyDistribution,
      averageTime: templates.reduce((sum, t) => sum + t.estimatedTime, 0) / templates.length
    };
  }, [templates]);

  const handleBookmarkToggle = async (templateId: string) => {
    try {
      const newBookmarks = new Set(bookmarkedTemplates);
      if (newBookmarks.has(templateId)) {
        newBookmarks.delete(templateId);
        await advancedTemplateService.removeBookmark(userId, templateId);
      } else {
        newBookmarks.add(templateId);
        await advancedTemplateService.addBookmark(userId, templateId);
      }
      setBookmarkedTemplates(newBookmarks);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    const templateIds = Array.from(selectedTemplates);
    
    switch (action) {
      case 'bookmark':
        for (const id of templateIds) {
          await handleBookmarkToggle(id);
        }
        break;
      case 'export':
        await exportTemplates(templateIds);
        break;
      case 'delete':
        // Handle with confirmation
        if (confirm(`Delete ${templateIds.length} templates?`)) {
          await deleteTemplates(templateIds);
          await loadTemplates();
        }
        break;
    }
    
    setSelectedTemplates(new Set());
  };

  const sortOptions: SortOption[] = [
    { field: 'updatedAt', label: 'Recently Updated', direction: 'desc' },
    { field: 'title', label: 'Title A-Z', direction: 'asc' },
    { field: 'title', label: 'Title Z-A', direction: 'desc' },
    { field: 'estimatedTime', label: 'Shortest Time', direction: 'asc' },
    { field: 'estimatedTime', label: 'Longest Time', direction: 'desc' },
    { field: 'rating', label: 'Highest Rated', direction: 'desc' },
    { field: 'usage', label: 'Most Used', direction: 'desc' },
    { field: 'category', label: 'Category', direction: 'asc' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cleaning': return <Activity className="w-4 h-4" />;
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'equipment': return <Settings className="w-4 h-4" />;
      case 'events': return <Calendar className="w-4 h-4" />;
      case 'hospitality': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
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
                <Layers className="w-6 h-6 mr-2 text-blue-600" />
                Enhanced Template Gallery
              </h2>
              <p className="text-gray-600 mt-1">
                {sortedTemplates.length} of {templates.length} templates
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  showAnalytics 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <PieChart className="w-4 h-4 mr-1" />
                Analytics
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </button>

              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={loadTemplates}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={`${sortBy.field}-${sortBy.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                const option = sortOptions.find(opt => opt.field === field && opt.direction === direction);
                if (option) setSortBy(option);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={`${option.field}-${option.direction}`} value={`${option.field}-${option.direction}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTemplates.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTemplates.size} template{selectedTemplates.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('bookmark')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Bookmark All
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => setSelectedTemplates(new Set())}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && analytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-200 bg-gray-50"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analytics.totalTemplates}</div>
                    <div className="text-sm text-gray-600">Total Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.totalUsage.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.averageTime)}</div>
                    <div className="text-sm text-gray-600">Avg Time (min)</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Category Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(category)}
                            <span className="text-sm capitalize text-gray-700">{category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(count / analytics.totalTemplates) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Difficulty Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.difficultyDistribution).map(([difficulty, count]) => (
                        <div key={difficulty} className="flex items-center justify-between">
                          <span className="text-sm capitalize text-gray-700">{difficulty}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  difficulty === 'easy' ? 'bg-green-600' :
                                  difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${(count / analytics.totalTemplates) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-200 bg-gray-50"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                    <div className="space-y-2">
                      {['cleaning', 'safety', 'equipment', 'events', 'hospitality', 'custom'].map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...filters.categories, category]
                                : filters.categories.filter(c => c !== category);
                              setFilters({ ...filters, categories: newCategories });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-2 flex items-center space-x-2">
                            {getCategoryIcon(category)}
                            <span className="text-sm capitalize text-gray-700">{category}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <div className="space-y-2">
                      {['easy', 'medium', 'hard'].map(difficulty => (
                        <label key={difficulty} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.difficulty.includes(difficulty)}
                            onChange={(e) => {
                              const newDifficulty = e.target.checked
                                ? [...filters.difficulty, difficulty]
                                : filters.difficulty.filter(d => d !== difficulty);
                              setFilters({ ...filters, difficulty: newDifficulty });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`ml-2 text-sm capitalize px-2 py-1 rounded text-xs border ${getDifficultyColor(difficulty)}`}>
                            {difficulty}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Time Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Time ({filters.estimatedTime.min} - {filters.estimatedTime.max} min)
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="480"
                        value={filters.estimatedTime.max}
                        onChange={(e) => setFilters({
                          ...filters,
                          estimatedTime: { ...filters.estimatedTime, max: parseInt(e.target.value) }
                        })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0 min</span>
                        <span>8 hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setFilters({
                      categories: [],
                      difficulty: [],
                      estimatedTime: { min: 0, max: 480 },
                      tags: [],
                      dateRange: { start: null, end: null },
                      rating: { min: 0, max: 5 },
                      usage: { min: 0, max: 1000 },
                      deviceTypes: [],
                      languages: [],
                      features: []
                    })}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear All Filters
                  </button>
                  <span className="text-sm text-gray-600">
                    {sortedTemplates.length} results
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates Grid/List */}
        <div className="p-6">
          {sortedTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : false)
                  ? 'Try adjusting your search or filters'
                  : 'Create your first template to get started'
                }
              </p>
              {(searchQuery || Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : false)) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      categories: [],
                      difficulty: [],
                      estimatedTime: { min: 0, max: 480 },
                      tags: [],
                      dateRange: { start: null, end: null },
                      rating: { min: 0, max: 5 },
                      usage: { min: 0, max: 1000 },
                      deviceTypes: [],
                      languages: [],
                      features: []
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Search & Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <motion.div
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}
                layout
              >
                <AnimatePresence>
                  {paginatedTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 ${
                        viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                      }`}
                    >
                      {/* Template Card Content */}
                      <div className={`${viewMode === 'list' ? 'flex-1 flex items-center space-x-4' : ''}`}>
                        <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className={`${viewMode === 'list' ? 'flex items-center space-x-3' : ''}`}>
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(template.category)}
                                <h3 className="font-medium text-gray-900 truncate">{template.title}</h3>
                              </div>
                              {viewMode === 'list' && (
                                <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(template.difficulty)}`}>
                                  {template.difficulty}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={() => handleBookmarkToggle(template.id)}
                                className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                              >
                                {bookmarkedTemplates.has(template.id) ? (
                                  <BookmarkCheck className="w-4 h-4 text-yellow-500" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>

                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedTemplates.has(template.id)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedTemplates);
                                    if (e.target.checked) {
                                      newSelected.add(template.id);
                                    } else {
                                      newSelected.delete(template.id);
                                    }
                                    setSelectedTemplates(newSelected);
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </label>
                            </div>
                          </div>

                          {viewMode === 'grid' && (
                            <>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>

                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {template.estimatedTime} min
                                </span>
                                <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(template.difficulty)}`}>
                                  {template.difficulty}
                                </span>
                                {template.qualityMetrics && (
                                  <span className="flex items-center">
                                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                    {template.qualityMetrics.overallScore.toFixed(1)}
                                  </span>
                                )}
                              </div>

                              {template.analytics && (
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                                  <span className="flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {template.analytics.usageStats.totalUsage} uses
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {template.analytics.usageStats.uniqueUsers} users
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                          {viewMode === 'list' && (
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {template.estimatedTime} min
                              </span>
                              {template.qualityMetrics && (
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                  {template.qualityMetrics.overallScore.toFixed(1)}
                                </span>
                              )}
                              {template.analytics && (
                                <span className="flex items-center">
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                  {template.analytics.usageStats.totalUsage} uses
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={`${viewMode === 'list' ? 'flex items-center space-x-2' : 'flex items-center justify-between pt-3 border-t border-gray-100'}`}>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onTemplatePreview?.(template)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onTemplateEdit?.(template)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onTemplateSelect?.(template)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              Use Template
                            </button>
                          </div>

                          {viewMode === 'grid' && (
                            <span className="text-xs text-gray-500">
                              Updated {new Date(template.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTemplates.length)} of {sortedTemplates.length} results
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="px-2 text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              currentPage === totalPages
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </FeatureGate>
  );
};

// Helper functions
async function exportTemplates(templateIds: string[]): Promise<void> {
  // Export templates to various formats
  console.log('Exporting templates:', templateIds);
}

async function deleteTemplates(templateIds: string[]): Promise<void> {
  // Delete templates from AWS
  console.log('Deleting templates:', templateIds);
}

export default EnhancedTemplateGallery;
