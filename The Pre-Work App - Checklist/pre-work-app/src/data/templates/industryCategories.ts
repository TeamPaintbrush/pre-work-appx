import { TemplateCategory, ChecklistTemplate } from '../../types';
import { IndustryTemplate, IndustrySubcategory } from '../../types/templates';

/**
 * Expanded Industry Categories with Professional Focus
 * Enterprise-grade template categorization system
 */

export const ENHANCED_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  // Core Service Industries
  {
    id: 'cleaning',
    name: 'Cleaning & Maintenance',
    description: 'Professional cleaning and maintenance templates for various environments',
    icon: '🧹',
    color: '#3B82F6',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'safety',
    name: 'Safety & Inspection',
    description: 'Comprehensive safety and inspection checklists for compliance',
    icon: '🛡️',
    color: '#10B981',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'maintenance',
    name: 'Equipment & Facility Maintenance',
    description: 'Equipment maintenance, repair, and facility management procedures',
    icon: '🔧',
    color: '#F59E0B',
    parentCategoryId: undefined,
    isActive: true
  },

  // Expanded Healthcare & Medical
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Medical procedures, patient care, and healthcare compliance',
    icon: '🏥',
    color: '#EF4444',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'healthcare-surgical',
    name: 'Surgical Procedures',
    description: 'Operating room setup, surgical instrument preparation',
    icon: '⚕️',
    color: '#DC2626',
    parentCategoryId: 'healthcare',
    isActive: true
  },
  {
    id: 'healthcare-patient',
    name: 'Patient Care',
    description: 'Patient room preparation, bedside procedures, discharge',
    icon: '🛏️',
    color: '#F87171',
    parentCategoryId: 'healthcare',
    isActive: true
  },

  // Construction & Trades (Expanded)
  {
    id: 'construction',
    name: 'Construction & Trades',
    description: 'Construction safety, quality control, and trade procedures',
    icon: '🏗️',
    color: '#6B7280',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'construction-electrical',
    name: 'Electrical Work',
    description: 'Electrical installation, testing, and safety procedures',
    icon: '⚡',
    color: '#FBBF24',
    parentCategoryId: 'construction',
    isActive: true
  },
  {
    id: 'construction-plumbing',
    name: 'Plumbing Systems',
    description: 'Plumbing installation, repair, and water system maintenance',
    icon: '🔧',
    color: '#3B82F6',
    parentCategoryId: 'construction',
    isActive: true
  },
  {
    id: 'construction-hvac',
    name: 'HVAC Systems',
    description: 'Heating, ventilation, and air conditioning procedures',
    icon: '🌡️',
    color: '#06B6D4',
    parentCategoryId: 'construction',
    isActive: true
  },

  // Hospitality & Service (Expanded)
  {
    id: 'hospitality',
    name: 'Hospitality & Service',
    description: 'Hotel, restaurant, and customer service standards',
    icon: '🏨',
    color: '#EC4899',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'hospitality-hotel',
    name: 'Hotel Operations',
    description: 'Room turnover, guest services, front desk procedures',
    icon: '🛎️',
    color: '#BE185D',
    parentCategoryId: 'hospitality',
    isActive: true
  },
  {
    id: 'hospitality-restaurant',
    name: 'Restaurant & Food Service',
    description: 'Kitchen prep, food safety, dining service procedures',
    icon: '🍽️',
    color: '#DB2777',
    parentCategoryId: 'hospitality',
    isActive: true
  },

  // New Industry Categories
  {
    id: 'manufacturing',
    name: 'Manufacturing & Production',
    description: 'Manufacturing processes, quality control, production line setup',
    icon: '🏭',
    color: '#7C3AED',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'manufacturing-quality',
    name: 'Quality Assurance',
    description: 'Product testing, quality control, compliance verification',
    icon: '✅',
    color: '#8B5CF6',
    parentCategoryId: 'manufacturing',
    isActive: true
  },
  {
    id: 'manufacturing-automotive',
    name: 'Automotive Production',
    description: 'Vehicle assembly, parts inspection, automotive testing',
    icon: '🚗',
    color: '#A855F7',
    parentCategoryId: 'manufacturing',
    isActive: true
  },

  {
    id: 'education',
    name: 'Education & Training',
    description: 'Educational facility management, training programs, student services',
    icon: '🎓',
    color: '#059669',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'education-lab',
    name: 'Laboratory Setup',
    description: 'Science lab preparation, equipment setup, safety protocols',
    icon: '🔬',
    color: '#047857',
    parentCategoryId: 'education',
    isActive: true
  },

  {
    id: 'retail',
    name: 'Retail & Commerce',
    description: 'Store operations, inventory management, customer experience',
    icon: '🛍️',
    color: '#DC2626',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'retail-inventory',
    name: 'Inventory Management',
    description: 'Stock counting, product receiving, warehouse organization',
    icon: '📦',
    color: '#B91C1C',
    parentCategoryId: 'retail',
    isActive: true
  },

  {
    id: 'agriculture',
    name: 'Agriculture & Farming',
    description: 'Farm operations, crop management, livestock care',
    icon: '🚜',
    color: '#16A34A',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'agriculture-livestock',
    name: 'Livestock Care',
    description: 'Animal health checks, feeding protocols, facility maintenance',
    icon: '🐄',
    color: '#15803D',
    parentCategoryId: 'agriculture',
    isActive: true
  },

  {
    id: 'transportation',
    name: 'Transportation & Logistics',
    description: 'Vehicle inspection, cargo handling, delivery protocols',
    icon: '🚛',
    color: '#0891B2',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'transportation-fleet',
    name: 'Fleet Management',
    description: 'Vehicle maintenance, driver checks, route planning',
    icon: '🚐',
    color: '#0E7490',
    parentCategoryId: 'transportation',
    isActive: true
  },

  {
    id: 'technology',
    name: 'Technology & IT',
    description: 'IT infrastructure, data center operations, technology deployment',
    icon: '💻',
    color: '#4F46E5',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'technology-datacenter',
    name: 'Data Center Operations',
    description: 'Server maintenance, network setup, security protocols',
    icon: '🖥️',
    color: '#4338CA',
    parentCategoryId: 'technology',
    isActive: true
  },

  {
    id: 'events',
    name: 'Events & Entertainment',
    description: 'Event planning, setup coordination, entertainment production',
    icon: '🎪',
    color: '#DB2777',
    parentCategoryId: undefined,
    isActive: true
  },
  {
    id: 'events-conference',
    name: 'Conference & Meeting Setup',
    description: 'Conference room setup, AV equipment, attendee services',
    icon: '🎤',
    color: '#BE185D',
    parentCategoryId: 'events',
    isActive: true
  },

  {
    id: 'environmental',
    name: 'Environmental & Sustainability',
    description: 'Environmental monitoring, waste management, sustainability practices',
    icon: '🌱',
    color: '#059669',
    parentCategoryId: undefined,
    isActive: true
  },

  {
    id: 'custom',
    name: 'Custom Templates',
    description: 'Create your own templates from scratch',
    icon: '⚡',
    color: '#06B6D4',
    parentCategoryId: undefined,
    isActive: true
  }
];

/**
 * Industry Template Collections
 * Organized by major industry with subcategories
 */
export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'service-industries',
    industryId: 'service',
    industryName: 'Service Industries',
    description: 'Cleaning, maintenance, hospitality, and customer service',
    icon: '🏢',
    color: '#3B82F6',
    totalTemplates: 45,
    templates: [], // Will be populated by service
    popularTemplates: ['office-cleaning', 'hotel-turnover', 'restaurant-prep'],
    subcategories: [
      {
        id: 'cleaning-services',
        name: 'Cleaning Services',
        description: 'Professional cleaning for all environments',
        templateCount: 15,
        templates: []
      },
      {
        id: 'hospitality-services',
        name: 'Hospitality Services',
        description: 'Hotel, restaurant, and guest services',
        templateCount: 12,
        templates: []
      }
    ]
  },
  {
    id: 'healthcare-medical',
    industryId: 'healthcare',
    industryName: 'Healthcare & Medical',
    description: 'Medical procedures, patient care, compliance',
    icon: '🏥',
    color: '#EF4444',
    totalTemplates: 38,
    templates: [],
    popularTemplates: ['patient-room-prep', 'surgical-checklist', 'discharge-process'],
    subcategories: [
      {
        id: 'clinical-procedures',
        name: 'Clinical Procedures',
        description: 'Medical procedures and patient care',
        templateCount: 20,
        templates: []
      },
      {
        id: 'facility-management',
        name: 'Medical Facility Management',
        description: 'Healthcare facility operations',
        templateCount: 18,
        templates: []
      }
    ]
  },
  {
    id: 'construction-trades',
    industryId: 'construction',
    industryName: 'Construction & Trades',
    description: 'Construction, electrical, plumbing, HVAC',
    icon: '🏗️',
    color: '#6B7280',
    totalTemplates: 52,
    templates: [],
    popularTemplates: ['site-safety', 'electrical-inspection', 'hvac-maintenance'],
    subcategories: [
      {
        id: 'safety-inspections',
        name: 'Safety Inspections',
        description: 'Construction site safety and compliance',
        templateCount: 18,
        templates: []
      },
      {
        id: 'trade-procedures',
        name: 'Trade Procedures',
        description: 'Electrical, plumbing, HVAC procedures',
        templateCount: 34,
        templates: []
      }
    ]
  },
  {
    id: 'manufacturing-production',
    industryId: 'manufacturing',
    industryName: 'Manufacturing & Production',
    description: 'Production lines, quality control, automotive',
    icon: '🏭',
    color: '#7C3AED',
    totalTemplates: 41,
    templates: [],
    popularTemplates: ['quality-control', 'production-setup', 'automotive-inspection'],
    subcategories: [
      {
        id: 'quality-assurance',
        name: 'Quality Assurance',
        description: 'Product testing and quality control',
        templateCount: 16,
        templates: []
      },
      {
        id: 'production-line',
        name: 'Production Line Setup',
        description: 'Manufacturing line preparation and operations',
        templateCount: 25,
        templates: []
      }
    ]
  },
  {
    id: 'technology-it',
    industryId: 'technology',
    industryName: 'Technology & IT',
    description: 'IT infrastructure, data centers, technology deployment',
    icon: '💻',
    color: '#4F46E5',
    totalTemplates: 29,
    templates: [],
    popularTemplates: ['server-deployment', 'network-setup', 'security-audit'],
    subcategories: [
      {
        id: 'infrastructure',
        name: 'IT Infrastructure',
        description: 'Server and network infrastructure',
        templateCount: 15,
        templates: []
      },
      {
        id: 'security-compliance',
        name: 'Security & Compliance',
        description: 'IT security and compliance procedures',
        templateCount: 14,
        templates: []
      }
    ]
  }
];

/**
 * Template Category Hierarchy Helper
 */
export class CategoryHierarchy {
  static getMainCategories(): TemplateCategory[] {
    return ENHANCED_TEMPLATE_CATEGORIES.filter(cat => !cat.parentCategoryId);
  }

  static getSubcategories(parentId: string): TemplateCategory[] {
    return ENHANCED_TEMPLATE_CATEGORIES.filter(cat => cat.parentCategoryId === parentId);
  }

  static getCategoryPath(categoryId: string): TemplateCategory[] {
    const category = ENHANCED_TEMPLATE_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return [];

    const path = [category];
    if (category.parentCategoryId) {
      const parent = ENHANCED_TEMPLATE_CATEGORIES.find(cat => cat.id === category.parentCategoryId);
      if (parent) {
        path.unshift(parent);
      }
    }
    return path;
  }

  static getCategoryTree(): Map<string, TemplateCategory[]> {
    const tree = new Map<string, TemplateCategory[]>();
    
    ENHANCED_TEMPLATE_CATEGORIES.forEach(category => {
      if (category.parentCategoryId) {
        const siblings = tree.get(category.parentCategoryId) || [];
        siblings.push(category);
        tree.set(category.parentCategoryId, siblings);
      }
    });

    return tree;
  }
}
