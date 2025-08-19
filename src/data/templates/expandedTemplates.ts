/**
 * EXPANDED TEMPLATES - ORGANIZED STRUCTURE
 * 
 * This file now imports from organized category files to maintain
 * better code organization and maintainability.
 * 
 * Each category is now in its own file under ./categories/
 * This reduces the single file from 4000+ lines to manageable chunks.
 */

// Import and re-export organized templates
export {
  ALL_EXPANDED_TEMPLATES,
  TEMPLATE_COUNT_SUMMARY,
  TEMPLATE_CATEGORIES_MAP,
  HEALTHCARE_TEMPLATES,
  CONSTRUCTION_TEMPLATES,
  CLEANING_TEMPLATES,
  PAINTING_TEMPLATES,
  SAFETY_TEMPLATES,
  EQUIPMENT_TEMPLATES,
  EVENT_TEMPLATES,
  HOSPITALITY_TEMPLATES,
  EVENT_SETUP_TEMPLATES
} from './categories';

// Import for default export
import ALL_EXPANDED_TEMPLATES_IMPORT from './categories';

// Export default for backward compatibility
export default ALL_EXPANDED_TEMPLATES_IMPORT;
