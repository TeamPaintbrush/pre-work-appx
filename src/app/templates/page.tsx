'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChecklistTemplate, UserRole } from '../../types';
import AdvancedTemplateGallery from '../../components/Templates/AdvancedTemplateGallery';

const TemplatesPage = () => {
  const router = useRouter();
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  
  // In a real app, this would come from authentication context
  const userRole: UserRole = 'manager'; // or from auth context

  const handleSelectTemplate = (template: ChecklistTemplate) => {
    console.log(`🎯 Using template: ${template.name} (ID: ${template.id})`);
    
    // Navigate to checklist page with template ID
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600 mt-1">Choose from professional templates or create your own</p>
          </div>
        </div>
      </div>

      {/* Advanced Template Gallery */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AdvancedTemplateGallery 
          userRole={userRole}
          onSelectTemplate={handleSelectTemplate} 
          onMarkFavorite={handleMarkFavorite}
          favoriteTemplates={favoriteTemplates}
        />
      </div>
    </div>
  );
};

export default TemplatesPage;
