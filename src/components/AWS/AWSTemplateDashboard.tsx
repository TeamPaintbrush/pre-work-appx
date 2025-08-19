// AWS Template Management Dashboard
// Central dashboard for managing templates stored in AWS

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAWSTemplates } from '../../hooks/useAWSTemplates';
import { FeatureGate } from '../AdvancedFeatures/FeatureToggleProvider';
import {
  Cloud,
  Database,
  Upload,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
  Search,
  Filter,
  Save,
  Trash2,
  Eye,
  Share2,
  Copy,
  Zap,
  Clock,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';

interface AWSTemplateDashboardProps {
  workspaceId: string;
  userId: string;
  userRole?: 'worker' | 'manager' | 'admin';
  className?: string;
}

const AWSTemplateDashboard: React.FC<AWSTemplateDashboardProps> = ({
  workspaceId,
  userId,
  userRole = 'manager',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'migration' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [healthStatus, setHealthStatus] = useState<{ dynamodb: boolean; s3: boolean } | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<number>(0);

  const {
    templates,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    deleteTemplate,
    migrateTemplates,
    verifyMigration,
    migrationStatus,
    refreshTemplates,
    healthCheck,
  } = useAWSTemplates({
    workspaceId,
    userId,
    autoLoad: true,
  });

  // Check AWS services health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await healthCheck();
      setHealthStatus(health);
    };
    
    checkHealth();
  }, [healthCheck]);

  // Handle template migration
  const handleMigration = async () => {
    setMigrationProgress(0);
    
    try {
      const result = await migrateTemplates();
      
      if (result) {
        setMigrationProgress(100);
        console.log('Migration completed:', result);
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get template statistics
  const templateStats = {
    total: templates.length,
    public: templates.filter(t => t.isPublic).length,
    private: templates.filter(t => !t.isPublic).length,
    categories: Array.from(new Set(templates.map(t => typeof t.category === 'string' ? t.category : t.category.name))).length,
    totalDownloads: 0, // StoredTemplate doesn't have downloadCount
    avgRating: 0, // StoredTemplate doesn't have rating
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Health Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            AWS Services Health
          </h3>
          <button
            onClick={healthCheck}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            {healthStatus?.dynamodb ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm">DynamoDB</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {healthStatus?.s3 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm">S3 Storage</span>
          </div>
        </div>
      </div>

      {/* Template Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templateStats.total}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Public Templates</p>
              <p className="text-2xl font-bold text-green-600">{templateStats.public}</p>
            </div>
            <Share2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Private Templates</p>
              <p className="text-2xl font-bold text-orange-600">{templateStats.private}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">{templateStats.categories}</p>
            </div>
            <Filter className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-blue-600">{templateStats.totalDownloads}</p>
            </div>
            <Download className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{templateStats.avgRating.toFixed(1)}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Recent Templates
        </h3>
        
        <div className="space-y-3">
          {templates.slice(0, 5).map((template) => (
            <div key={template.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-500">{template.category.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}</span>
                {template.isPublic && <Share2 className="w-3 h-3" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Array.from(new Set(templates.map(t => t.category.name))).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <button
            onClick={refreshTemplates}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {template.category.name}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>0</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>0.0</span>
              </div>
              <div className="flex items-center space-x-1">
                {template.isPublic ? (
                  <Share2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Eye className="w-4 h-4 text-orange-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Updated {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteTemplate(template.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add some templates.</p>
        </div>
      )}
    </div>
  );

  const renderMigrationTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2 text-blue-600" />
          Template Migration to AWS
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Migrate your existing templates to AWS for better performance, scalability, and reliability.
          </p>
          
          {migrationStatus && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Migration Results:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Total Templates: {migrationStatus.totalTemplates}</div>
                <div>Migrated: {migrationStatus.migratedTemplates}</div>
                <div>Failed: {migrationStatus.failedTemplates}</div>
                <div>Success Rate: {((migrationStatus.migratedTemplates / migrationStatus.totalTemplates) * 100).toFixed(1)}%</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMigration}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'Migrating...' : 'Start Migration'}
            </button>
            
            <button
              onClick={verifyMigration}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Migration
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <FeatureGate feature="aiDashboard">
      <div className={`max-w-7xl mx-auto space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Cloud className="w-6 h-6 mr-2 text-blue-600" />
              AWS Template Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your templates stored in AWS cloud infrastructure</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
            
            {loading && (
              <div className="flex items-center text-blue-600 text-sm">
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'templates', label: 'Templates', icon: Database },
              { id: 'migration', label: 'Migration', icon: Cloud },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'templates' && renderTemplatesTab()}
            {activeTab === 'migration' && renderMigrationTab()}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AWS Configuration</h3>
                <p className="text-gray-600">AWS settings and configuration options will be available here.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </FeatureGate>
  );
};

export default AWSTemplateDashboard;
