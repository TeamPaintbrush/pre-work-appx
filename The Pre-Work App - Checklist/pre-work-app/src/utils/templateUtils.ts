import { ChecklistTemplate, PreWorkChecklist, ChecklistSection, ChecklistItem, Priority } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Converts a ChecklistTemplate to a PreWorkChecklist
 * This creates a working checklist instance from a template
 */
export const createChecklistFromTemplate = (template: ChecklistTemplate): PreWorkChecklist => {
  const now = new Date();
  
  // Convert template sections to checklist sections
  const sections: ChecklistSection[] = template.sections.map(templateSection => {
    const items = templateSection.items.map(templateItem => ({
      id: uuidv4(),
      text: templateItem.title,
      description: templateItem.description || '',
      isCompleted: false,
      isRequired: templateItem.isRequired,
      isOptional: templateItem.isOptional,
      priority: 'medium' as Priority,
      notes: '',
      attachments: [],
      timestamp: now,
      completedAt: undefined,
      estimatedTime: templateItem.estimatedTime,
      actualTime: undefined,
      requiresPhoto: templateItem.requiresPhoto,
      requiresNotes: templateItem.requiresNotes,
      tags: templateItem.tags || [],
      instructions: templateItem.instructions,
      warningMessage: templateItem.warningMessage,
      dependencies: templateItem.dependencies || [],
      templateItemId: templateItem.id,
      validationErrors: [],
      skippedReason: undefined,
      isSkipped: false,
      isCustom: false,
      customFields: {},
      dueDate: undefined
    } as ChecklistItem));

    return {
      id: uuidv4(),
      title: templateSection.title,
      description: templateSection.description,
      items: items,
      isCollapsed: false,
      completedCount: 0,
      totalCount: items.length,
      isOptional: templateSection.isOptional,
      order: templateSection.order,
      preConditions: templateSection.preConditions,
      templateSectionId: templateSection.id,
      estimatedTime: items.reduce((total, item) => total + (item.estimatedTime || 0), 0),
      actualTime: undefined
    } as ChecklistSection;
  });

  // Create the checklist
  const checklist: PreWorkChecklist = {
    id: uuidv4(),
    title: template.name,
    description: template.description,
    sections: sections,
    createdAt: now,
    lastModified: now,
    progress: 0,
    isCompleted: false,
    completedAt: undefined,
    templateId: template.id,
    templateVersion: template.version,
    category: template.category,
    tags: [...template.tags],
    assignedTo: undefined,
    assignedBy: undefined,
    dueDate: undefined,
    priority: template.difficulty === 'hard' ? 'high' : template.difficulty === 'easy' ? 'low' : 'medium',
    estimatedDuration: template.estimatedDuration,
    actualDuration: undefined,
    startedAt: undefined,
    location: undefined,
    weatherConditions: undefined,
    equipment: [],
    safetyNotes: undefined
  };

  return checklist;

  return checklist;
};

/**
 * Validates if a template can be converted to a checklist
 */
export const validateTemplateForConversion = (template: ChecklistTemplate): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!template.id) {
    errors.push('Template ID is required');
  }

  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is required');
  }

  if (!template.sections || template.sections.length === 0) {
    errors.push('Template must have at least one section');
  }

  // Check each section
  template.sections.forEach((section, sectionIndex) => {
    if (!section.title || section.title.trim() === '') {
      errors.push(`Section ${sectionIndex + 1} must have a title`);
    }

    if (!section.items || section.items.length === 0) {
      errors.push(`Section "${section.title}" must have at least one item`);
    }

    // Check each item
    section.items.forEach((item, itemIndex) => {
      if (!item.title || item.title.trim() === '') {
        errors.push(`Item ${itemIndex + 1} in section "${section.title}" must have a title`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates a preview of what the checklist will look like from a template
 */
export const getChecklistPreview = (template: ChecklistTemplate) => {
  const totalItems = template.sections.reduce((total, section) => total + section.items.length, 0);
  const requiredItems = template.sections.reduce((total, section) => 
    total + section.items.filter(item => item.isRequired).length, 0
  );
  const optionalSections = template.sections.filter(section => section.isOptional).length;

  return {
    totalSections: template.sections.length,
    totalItems,
    requiredItems,
    optionalItems: totalItems - requiredItems,
    optionalSections,
    estimatedDuration: template.estimatedDuration,
    difficulty: template.difficulty,
    requiredSkills: template.requiredSkills || []
  };
};
