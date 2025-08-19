'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ChecklistContainer from '../../components/Checklist/ChecklistContainer';
import { PreWorkChecklist } from '../../types';
import { createChecklistFromTemplate, validateTemplateForConversion } from '../../utils/templateUtils';
import { ALL_PRESET_TEMPLATES } from '../../data/presetChecklists';
import { TemplateIntegrationService } from '../../services/templates/TemplateIntegrationService';
import Button from '../../components/UI/Button';
import { ChecklistEnhancementOverlay } from '../../components/AdvancedFeatures/ChecklistEnhancementOverlay';
import { FeatureGate } from '../../components/AdvancedFeatures/FeatureToggleProvider';

const ChecklistPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checklist, setChecklist] = useState<PreWorkChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const templateId = searchParams.get('templateId');
    const checklistId = searchParams.get('checklistId');

    if (templateId) {
      // Create checklist from template
      createChecklistFromTemplateId(templateId);
    } else if (checklistId) {
      // Load existing checklist (for now, just show an error)
      setError('Loading existing checklists is not yet implemented. Use a template ID instead.');
      setIsLoading(false);
    } else {
      setError('No template ID or checklist ID provided');
      setIsLoading(false);
    }
  }, [searchParams]);

  const createChecklistFromTemplateId = async (templateId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize template service if needed
      const templateService = TemplateIntegrationService.getInstance();
      await templateService.initialize();

      // Find the template in our database
      const allTemplates = templateService.getAllTemplates();
      const template = allTemplates.find(t => t.id === templateId);
      
      if (!template) {
        setError(`Template with ID "${templateId}" not found`);
        setIsLoading(false);
        return;
      }

      // Validate template
      const validation = validateTemplateForConversion(template);
      if (!validation.isValid) {
        setError(`Template validation failed: ${validation.errors.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Create checklist from template
      const newChecklist = createChecklistFromTemplate(template);
      setChecklist(newChecklist);
      setIsLoading(false);

      // Log success
      console.log(`✅ Successfully created checklist from template: ${template.name}`);
      console.log('Checklist details:', {
        id: newChecklist.id,
        title: newChecklist.title,
        sections: newChecklist.sections.length,
        totalItems: newChecklist.sections.reduce((total, section) => total + section.items.length, 0),
        templateId: newChecklist.templateId,
        templateVersion: newChecklist.templateVersion
      });

    } catch (err) {
      console.error('Error creating checklist from template:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleSaveChecklist = (updatedChecklist: PreWorkChecklist) => {
    console.log('💾 Saving checklist:', updatedChecklist.title);
    setChecklist(updatedChecklist);
    // In a real app, this would save to a database
  };

  const handleExportChecklist = (exportData: any) => {
    console.log('📤 Exporting checklist data:', exportData);
    // In a real app, this would handle the export
  };

  const handleBackToTemplates = () => {
    router.push('/templates');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Creating your checklist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Checklist</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={handleBackToTemplates} variant="primary">
              Back to Templates
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No checklist data available</p>
          <Button onClick={handleBackToTemplates} className="mt-4">
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToTemplates} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Templates</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{checklist.title}</h1>
                <p className="text-gray-600">
                  Created from template • {checklist.sections.length} sections • 
                  {checklist.sections.reduce((total, section) => total + section.items.length, 0)} items
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {checklist.templateId && (
                <div className="text-sm text-gray-500">
                  Template: {checklist.templateVersion && `v${checklist.templateVersion}`}
                </div>
              )}
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>🎯</span>
                <span>{Math.round(checklist.progress)}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Advanced Features Indicator */}
        <FeatureGate feature="enableComments">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Advanced Features Active</h3>
                <p className="text-blue-700">
                  Enhanced collaboration tools are now available. You can add comments, track time, 
                  share files, and @mention team members on any checklist item.
                </p>
              </div>
            </div>
          </div>
        </FeatureGate>

        {/* Enhanced Checklist Experience */}
        <div className="relative">
          <ChecklistContainer
            initialChecklist={checklist}
            onSave={handleSaveChecklist}
            onExport={handleExportChecklist}
          />
          
          {/* Advanced Features Enhancement Overlay - positioned absolutely */}
          <ChecklistEnhancementOverlay 
            checklist={{
              id: checklist.id,
              name: checklist.title,
              description: checklist.description || '',
              category: { 
                id: checklist.templateId || 'default', 
                name: 'Checklist', 
                description: 'Active Checklist',
                isActive: true 
              },
              version: checklist.templateVersion || '1.0.0',
              tags: ['active', 'checklist'],
              isBuiltIn: false,
              createdAt: checklist.createdAt || new Date(),
              lastModified: checklist.lastModified || new Date(),
              sections: checklist.sections.map(section => ({
                id: section.id,
                title: section.title,
                description: section.description || '',
                items: section.items.map(item => ({
                  id: item.id,
                  title: item.text,
                  description: item.description || '',
                  isRequired: item.isRequired,
                  isOptional: item.isOptional || false,
                  requiresPhoto: item.requiresPhoto || false,
                  requiresNotes: item.requiresNotes || false,
                  tags: item.tags || [],
                  order: 0
                })),
                order: 0,
                isOptional: false
              }))
            }}
            items={checklist.sections.flatMap(section => section.items)}
            onItemUpdate={(itemId, updates) => {
              console.log('Advanced feature update for item:', itemId, updates);
              // Handle advanced feature updates here
            }}
            className="absolute inset-0 pointer-events-none"
          />
        </div>

        {/* Advanced Analytics Panel */}
        <FeatureGate feature="enableAdvancedAnalytics">
          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Advanced Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(checklist.progress)}%</div>
                <div className="text-sm text-blue-700">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {checklist.sections.reduce((total, section) => total + section.items.filter(item => item.isCompleted).length, 0)}
                </div>
                <div className="text-sm text-green-700">Items Completed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {checklist.sections.length}
                </div>
                <div className="text-sm text-purple-700">Active Sections</div>
              </div>
            </div>
          </div>
        </FeatureGate>
      </div>
    </div>
  );
};

const ChecklistPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ChecklistPageContent />
    </Suspense>
  );
};

export default ChecklistPage;
