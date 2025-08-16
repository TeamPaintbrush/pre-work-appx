'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ChecklistContainer from '../../components/Checklist/ChecklistContainer';
import { PreWorkChecklist } from '../../types';
import { createChecklistFromTemplate, validateTemplateForConversion } from '../../utils/templateUtils';
import { PRESET_TEMPLATES } from '../../data/presetChecklists';
import Button from '../../components/UI/Button';

const ChecklistPage = () => {
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

      // Find the template in our database
      const template = PRESET_TEMPLATES.find(t => t.id === templateId);
      
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
        <ChecklistContainer
          initialChecklist={checklist}
          onSave={handleSaveChecklist}
          onExport={handleExportChecklist}
        />
      </div>
    </div>
  );
};

export default ChecklistPage;
