'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChecklistTemplate, UserRole } from '../../types';
import TemplateGallery from '../../components/Templates/TemplateGallery';
import AdvancedTemplatesDashboard from '../../components/Templates/Advanced/AdvancedTemplatesDashboard';
import AWSTemplateDashboard from '../../components/AWS/AWSTemplateDashboard';
import { FeatureGate } from '../../components/AdvancedFeatures/FeatureToggleProvider';

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false);
  const [showAWSDashboard, setShowAWSDashboard] = useState(false);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  
  // Default user role for this client component
  const userRole: UserRole = 'viewer';

  const handleTemplateSelect = (template: ChecklistTemplate) => {
    console.log(`🎯 Using template: ${template.name} (ID: ${template.id})`);
    router.push(`/checklist?templateId=${template.id}`);
  };

  const handleMarkFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Note: ChecklistEnhancementOverlay is only needed on checklist pages, not templates */}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📋 Pre-Work Templates
            </h1>
            <p className="text-gray-600">
              Choose from our comprehensive collection of industry-specific checklists
            </p>
          </div>

          {/* Dashboard Controls */}
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <FeatureGate feature="enableProjectTemplates">
              <button
                onClick={() => setShowAdvancedDashboard(!showAdvancedDashboard)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span className="text-lg mr-2">⚡</span>
                <span>
                  {showAdvancedDashboard ? 'Hide Advanced' : 'Advanced Features'}
                </span>
              </button>
            </FeatureGate>

            <FeatureGate feature="enableIntegrations">
              <button
                onClick={() => setShowAWSDashboard(!showAWSDashboard)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showAWSDashboard
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>☁️</span>
                <span className="ml-2">
                  {showAWSDashboard ? 'Hide AWS Storage' : 'AWS Storage'}
                </span>
              </button>
            </FeatureGate>
          </div>
        </div>

        {/* AWS Template Dashboard */}
        <FeatureGate feature="enableIntegrations">
          {showAWSDashboard && (
            <div className="mb-8">
              <AWSTemplateDashboard
                userRole={userRole === 'viewer' ? 'worker' : userRole === 'supervisor' ? 'manager' : (userRole as 'worker' | 'manager' | 'admin')}
                workspaceId="default-workspace"
                userId="current-user"
              />
            </div>
          )}
        </FeatureGate>

        {/* Advanced Templates Dashboard */}
        <FeatureGate feature="enableProjectTemplates">
          {showAdvancedDashboard && (
            <div className="mb-8">
              <AdvancedTemplatesDashboard 
                workspaceId="default-workspace"
                userId="current-user"
              />
            </div>
          )}
        </FeatureGate>

        {/* Main Template Gallery */}
                {/* Main Template Gallery */}
        <TemplateGallery
          workspaceId="default-workspace"
          userId="current-user"
          userRole={userRole}
          onTemplateSelect={handleTemplateSelect}
          onMarkFavorite={handleMarkFavorite}
          favoriteTemplates={favoriteTemplates}
        />

        {/* Advanced Features Information */}
        <FeatureGate feature="enableProjectTemplates">
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Advanced Template Features Enabled
            </h3>
            <p className="text-blue-700 mb-4">
              You now have access to enhanced template management capabilities:
            </p>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Dynamic template builder with conditional logic</li>
              <li>• Comprehensive analytics and data visualization</li>
              <li>• Mobile-optimized template interface</li>
              <li>• Enhanced search and filtering</li>
              <li>• Real-time collaboration features</li>
              <li>• Advanced quality metrics and insights</li>
              <li>• AWS-powered template storage and synchronization</li>
            </ul>
          </div>
        </FeatureGate>
      </div>
    </div>
  );
}
