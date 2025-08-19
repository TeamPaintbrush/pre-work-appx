import { ChecklistTemplate } from '../../../types';

// Import all category templates
import { HEALTHCARE_TEMPLATES } from './healthcare';
import { CONSTRUCTION_TEMPLATES } from './construction';
import { CLEANING_TEMPLATES } from './cleaning';
import { PAINTING_TEMPLATES } from './painting';
import { SAFETY_TEMPLATES } from './safety';
import { EQUIPMENT_TEMPLATES } from './equipment';
import { EVENT_TEMPLATES } from './events';
import { HOSPITALITY_TEMPLATES } from './hospitality';
import { EVENT_SETUP_TEMPLATES } from './event-setup';

// Export individual category arrays
export {
  HEALTHCARE_TEMPLATES,
  CONSTRUCTION_TEMPLATES,
  CLEANING_TEMPLATES,
  PAINTING_TEMPLATES,
  SAFETY_TEMPLATES,
  EQUIPMENT_TEMPLATES,
  EVENT_TEMPLATES,
  HOSPITALITY_TEMPLATES,
  EVENT_SETUP_TEMPLATES
};

// Export categories map and types
export { TEMPLATE_CATEGORIES_MAP } from './types';

// Combine all templates into a single array
export const ALL_EXPANDED_TEMPLATES: ChecklistTemplate[] = [
  ...HEALTHCARE_TEMPLATES,
  ...CONSTRUCTION_TEMPLATES,
  ...CLEANING_TEMPLATES,
  ...PAINTING_TEMPLATES,
  ...SAFETY_TEMPLATES,
  ...EQUIPMENT_TEMPLATES,
  ...EVENT_TEMPLATES,
  ...HOSPITALITY_TEMPLATES,
  ...EVENT_SETUP_TEMPLATES
];

// Template count summary for monitoring
export const TEMPLATE_COUNT_SUMMARY = {
  'Healthcare Templates': HEALTHCARE_TEMPLATES.length,
  'Construction Templates': CONSTRUCTION_TEMPLATES.length,
  'Cleaning Templates': CLEANING_TEMPLATES.length,
  'Painting Templates': PAINTING_TEMPLATES.length,
  'Safety Templates': SAFETY_TEMPLATES.length,
  'Equipment Templates': EQUIPMENT_TEMPLATES.length,
  'Event Preparation Templates': EVENT_TEMPLATES.length,
  'Hospitality Templates': HOSPITALITY_TEMPLATES.length,
  'Event Setup Templates': EVENT_SETUP_TEMPLATES.length,
  'Total Expanded': ALL_EXPANDED_TEMPLATES.length
};

// Log template counts for debugging
console.log('📊 Template Count Summary (Organized):', TEMPLATE_COUNT_SUMMARY);
console.log('🔍 Individual Template Array Lengths:');
console.log('Healthcare:', HEALTHCARE_TEMPLATES.length);
console.log('Construction:', CONSTRUCTION_TEMPLATES.length);
console.log('Cleaning:', CLEANING_TEMPLATES.length);
console.log('Painting:', PAINTING_TEMPLATES.length);
console.log('Safety:', SAFETY_TEMPLATES.length);
console.log('Equipment:', EQUIPMENT_TEMPLATES.length);
console.log('Event Preparation:', EVENT_TEMPLATES.length);
console.log('Hospitality:', HOSPITALITY_TEMPLATES.length);
console.log('Event Setup:', EVENT_SETUP_TEMPLATES.length);

export default ALL_EXPANDED_TEMPLATES;
