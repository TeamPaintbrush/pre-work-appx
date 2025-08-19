import { ChecklistTemplate } from '../../../types';

// Define template categories to avoid circular dependency
export const TEMPLATE_CATEGORIES_MAP = {
  healthcare: { id: 'healthcare', name: 'Healthcare & Medical', description: 'Medical procedures, patient care, and healthcare compliance', icon: '🏥', color: '#EF4444', isActive: true },
  construction: { id: 'construction', name: 'Construction & Trade', description: 'Construction safety, quality control, and trade procedures', icon: '�', color: '#F59E0B', isActive: true },
  'cleaning-maintenance': { id: 'cleaning-maintenance', name: 'Cleaning & Maintenance', description: 'Professional cleaning and maintenance templates for various environments', icon: '🧹', color: '#16A34A', isActive: true },
  painting: { id: 'painting', name: 'Painting & Decoration', description: 'Painting and decoration procedures', icon: '🎨', color: '#DC2626', isActive: true },
  'safety-inspection': { id: 'safety-inspection', name: 'Safety Inspection', description: 'Comprehensive safety and inspection checklists for compliance', icon: '🔍', color: '#F59E0B', isActive: true },
  'equipment-maintenance': { id: 'equipment-maintenance', name: 'Equipment Maintenance', description: 'Equipment maintenance and repair procedures', icon: '⚙️', color: '#6B7280', isActive: true },
  'event-preparation': { id: 'event-preparation', name: 'Event Preparation', description: 'Event setup, coordination, and breakdown templates', icon: '🎪', color: '#8B5CF6', isActive: true },
  'hospitality-service': { id: 'hospitality-service', name: 'Hospitality & Service', description: 'Hotel, restaurant, and customer service standards', icon: '🏨', color: '#059669', isActive: true },
  'event-setup': { id: 'event-setup', name: 'Event Setup', description: 'Technical event setup and equipment installation', icon: '🎭', color: '#DC2626', isActive: true }
};

export type TemplateCategory = typeof TEMPLATE_CATEGORIES_MAP[keyof typeof TEMPLATE_CATEGORIES_MAP];
