import { ChecklistTemplate, TemplateCategory } from '../../types';

// Additional Templates - Supplementary collection
export const ALL_ADDITIONAL_TEMPLATES: ChecklistTemplate[] = [
  // This file can be used for additional templates that supplement the main expanded templates
  // Currently empty but available for future expansion
];

// Template count summary for additional templates
export const ADDITIONAL_TEMPLATE_COUNT_SUMMARY = {
  total: 0,
  byCategory: {},
  byDifficulty: {
    easy: 0,
    medium: 0,
    hard: 0
  },
  byTag: {}
};

export default ALL_ADDITIONAL_TEMPLATES;