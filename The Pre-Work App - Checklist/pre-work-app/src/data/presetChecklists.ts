import { PreWorkChecklist, ChecklistTemplate, TemplateCategory, ChecklistItem, ChecklistSection, TemplateSectionDefinition, TemplateItemDefinition } from '../types';

// Template Categories - Professional & Industry Focus
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'cleaning',
    name: 'Cleaning & Maintenance',
    description: 'Professional cleaning and maintenance templates for various environments',
    icon: '🧹',
    color: '#3B82F6',
    isActive: true
  },
  {
    id: 'inspection',
    name: 'Safety Inspection',
    description: 'Comprehensive safety and inspection checklists for compliance',
    icon: '🔍',
    color: '#10B981',
    isActive: true
  },
  {
    id: 'maintenance',
    name: 'Equipment Maintenance',
    description: 'Equipment maintenance and repair procedures',
    icon: '🔧',
    color: '#F59E0B',
    isActive: true
  },
  {
    id: 'event',
    name: 'Event Preparation',
    description: 'Event setup, coordination, and breakdown templates',
    icon: '🎪',
    color: '#8B5CF6',
    isActive: true
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    description: 'Medical procedures, patient care, and healthcare compliance',
    icon: '🏥',
    color: '#EF4444',
    isActive: true
  },
  {
    id: 'construction',
    name: 'Construction & Trade',
    description: 'Construction safety, quality control, and trade procedures',
    icon: '🏗️',
    color: '#6B7280',
    isActive: true
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Service',
    description: 'Hotel, restaurant, and customer service standards',
    icon: '🛎️',
    color: '#EC4899',
    isActive: true
  },
  {
    id: 'custom',
    name: 'Custom Templates',
    description: 'Create your own templates from scratch',
    icon: '⚡',
    color: '#06B6D4',
    isActive: true
  },
  {
    id: 'events',
    name: 'Event Setup',
    description: 'Templates for event planning, setup, and coordination',
    icon: '🎪',
    color: '#F59E0B',
    isActive: true
  },
  {
    id: 'construction',
    name: 'Construction & Trades',
    description: 'Templates for construction, trades, and technical work',
    icon: '🔨',
    color: '#EF4444',
    isActive: true
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Service',
    description: 'Templates for hospitality, customer service, and retail',
    icon: '🏨',
    color: '#8B5CF6',
    isActive: true
  }
];

// Helper function to create template items with default values
const createTemplateItem = (item: {
  id: string;
  title: string;
  description?: string;
  isRequired?: boolean;
  estimatedTime?: number;
  requiresPhoto?: boolean;
  requiresNotes?: boolean;
  tags?: string[];
  order?: number;
}): TemplateItemDefinition => ({
  id: item.id,
  title: item.title,
  description: item.description,
  isRequired: item.isRequired ?? true,
  isOptional: !(item.isRequired ?? true),
  order: item.order ?? 1,
  estimatedTime: item.estimatedTime ?? 15,
  requiresPhoto: item.requiresPhoto ?? false,
  requiresNotes: item.requiresNotes ?? false,
  tags: item.tags ?? [],
  preConditions: []
});

// Comprehensive Template Library
export const PRESET_TEMPLATES: ChecklistTemplate[] = [
  // CLEANING & MAINTENANCE TEMPLATES
  {
    id: 'office-cleaning',
    name: 'Office Deep Clean',
    description: 'Comprehensive office cleaning checklist for commercial spaces',
    category: TEMPLATE_CATEGORIES[0],
    version: '1.0',
    tags: ['office', 'commercial', 'deep-clean'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['Commercial Cleaning', 'Equipment Operation'],
    sections: [
      {
        id: 'prep',
        title: 'Preparation & Setup',
        description: 'Initial preparation and equipment setup',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'supplies-check',
            title: 'Check cleaning supplies inventory',
            description: 'Verify all necessary cleaning supplies are available',
            isRequired: true,
            estimatedTime: 10,
            requiresPhoto: true,
            tags: ['supplies', 'inventory'],
            order: 1
          }),
          createTemplateItem({
            id: 'equipment-setup',
            title: 'Set up cleaning equipment',
            description: 'Prepare vacuums, mops, and other equipment',
            isRequired: true,
            estimatedTime: 15,
            requiresPhoto: false,
            tags: ['equipment', 'setup'],
            order: 2
          })
        ],
        preConditions: []
      },
      {
        id: 'workspace',
        title: 'Workspace Cleaning',
        description: 'Clean individual workstations and common areas',
        isOptional: false,
        order: 2,
        items: [
          createTemplateItem({
            id: 'desk-cleaning',
            title: 'Clean and sanitize desks',
            description: 'Wipe down all desk surfaces with appropriate cleaners',
            isRequired: true,
            estimatedTime: 30,
            requiresPhoto: true,
            tags: ['desks', 'sanitization'],
            order: 1
          }),
          createTemplateItem({
            id: 'computer-cleaning',
            title: 'Clean computer equipment',
            description: 'Carefully clean keyboards, monitors, and peripherals',
            isRequired: true,
            estimatedTime: 20,
            requiresPhoto: false,
            tags: ['computers', 'electronics'],
            order: 2
          })
        ],
        preConditions: []
      }
    ]
  },

  {
    id: 'restaurant-cleaning',
    name: 'Restaurant End-of-Day Clean',
    description: 'Complete restaurant cleaning and sanitization procedure',
    category: TEMPLATE_CATEGORIES[0],
    version: '1.0',
    tags: ['restaurant', 'food-service', 'sanitization'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 240,
    difficulty: 'hard',
    requiredSkills: ['Food Service Cleaning', 'Health Code Compliance'],
    sections: [
      {
        id: 'kitchen',
        title: 'Kitchen Deep Clean',
        description: 'Complete kitchen sanitization and equipment cleaning',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'grill-cleaning',
            title: 'Clean and degrease grills',
            description: 'Deep clean all cooking surfaces and remove grease buildup',
            isRequired: true,
            estimatedTime: 45,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['grill', 'degreasing', 'kitchen'],
            order: 1
          }),
          createTemplateItem({
            id: 'fryer-maintenance',
            title: 'Clean fryers and change oil',
            description: 'Filter or change fryer oil and clean equipment',
            isRequired: true,
            estimatedTime: 30,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['fryer', 'oil-change', 'maintenance'],
            order: 2
          })
        ],
        preConditions: []
      }
    ]
  },

  // SAFETY INSPECTION TEMPLATES
  {
    id: 'workplace-safety',
    name: 'Workplace Safety Inspection',
    description: 'Comprehensive workplace safety and OSHA compliance check',
    category: TEMPLATE_CATEGORIES[1],
    version: '1.0',
    tags: ['OSHA', 'workplace-safety', 'compliance'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['Safety Inspector', 'OSHA Knowledge'],
    sections: [
      {
        id: 'emergency-systems',
        title: 'Emergency Systems Check',
        description: 'Verify all emergency systems are functional',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'fire-extinguishers',
            title: 'Check fire extinguisher status',
            description: 'Verify pressure, accessibility, and inspection dates',
            isRequired: true,
            estimatedTime: 15,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['fire-safety', 'extinguishers', 'emergency'],
            order: 1
          }),
          createTemplateItem({
            id: 'emergency-exits',
            title: 'Verify emergency exit accessibility',
            description: 'Ensure all exits are clear and properly marked',
            isRequired: true,
            estimatedTime: 10,
            requiresPhoto: true,
            tags: ['emergency-exits', 'accessibility', 'safety'],
            order: 2
          })
        ],
        preConditions: []
      }
    ]
  },

  {
    id: 'vehicle-inspection',
    name: 'Vehicle Safety Inspection',
    description: 'Pre-trip vehicle safety and maintenance inspection',
    category: TEMPLATE_CATEGORIES[1],
    version: '1.0',
    tags: ['vehicle', 'transportation', 'DOT'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 45,
    difficulty: 'easy',
    requiredSkills: ['Vehicle Inspection', 'Basic Maintenance'],
    sections: [
      {
        id: 'exterior',
        title: 'Exterior Inspection',
        description: 'Check vehicle exterior components',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'tire-condition',
            title: 'Inspect tire condition and pressure',
            description: 'Check for wear, damage, and proper inflation',
            isRequired: true,
            estimatedTime: 10,
            requiresPhoto: true,
            tags: ['tires', 'inspection', 'maintenance'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // EQUIPMENT MAINTENANCE TEMPLATES
  {
    id: 'hvac-maintenance',
    name: 'HVAC System Maintenance',
    description: 'Routine HVAC system inspection and maintenance',
    category: TEMPLATE_CATEGORIES[2],
    version: '1.0',
    tags: ['HVAC', 'maintenance', 'climate-control'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 90,
    difficulty: 'hard',
    requiredSkills: ['HVAC Technician', 'Electrical Safety'],
    sections: [
      {
        id: 'filters',
        title: 'Filter Inspection & Replacement',
        description: 'Check and replace air filters as needed',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'filter-check',
            title: 'Inspect air filter condition',
            description: 'Check for dirt buildup and damage',
            isRequired: true,
            estimatedTime: 15,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['filters', 'air-quality', 'maintenance'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // EVENT PREPARATION TEMPLATES
  {
    id: 'conference-setup',
    name: 'Conference Event Setup',
    description: 'Complete conference and meeting event preparation',
    category: TEMPLATE_CATEGORIES[3],
    version: '1.0',
    tags: ['conference', 'meeting', 'corporate-event'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['Event Coordination', 'AV Setup'],
    sections: [
      {
        id: 'venue-prep',
        title: 'Venue Preparation',
        description: 'Set up venue space and seating arrangements',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'seating-arrangement',
            title: 'Arrange seating for attendees',
            description: 'Set up chairs and tables according to floor plan',
            isRequired: true,
            estimatedTime: 45,
            requiresPhoto: true,
            tags: ['seating', 'venue', 'setup'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  {
    id: 'wedding-setup',
    name: 'Wedding Event Setup',
    description: 'Complete wedding ceremony and reception preparation',
    category: TEMPLATE_CATEGORIES[3],
    version: '1.0',
    tags: ['wedding', 'ceremony', 'reception'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 300,
    difficulty: 'hard',
    requiredSkills: ['Event Planning', 'Decoration', 'Coordination'],
    sections: [
      {
        id: 'ceremony-setup',
        title: 'Ceremony Setup',
        description: 'Prepare ceremony space and decorations',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'altar-setup',
            title: 'Set up ceremony altar/arch',
            description: 'Install and decorate ceremony focal point',
            isRequired: true,
            estimatedTime: 60,
            requiresPhoto: true,
            tags: ['ceremony', 'decoration', 'altar'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // HEALTHCARE TEMPLATES
  {
    id: 'patient-room-cleaning',
    name: 'Patient Room Sanitization',
    description: 'Hospital-grade patient room cleaning and disinfection',
    category: TEMPLATE_CATEGORIES[4],
    version: '1.0',
    tags: ['healthcare', 'sanitization', 'infection-control'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 45,
    difficulty: 'medium',
    requiredSkills: ['Healthcare Cleaning', 'Infection Control'],
    sections: [
      {
        id: 'high-touch-surfaces',
        title: 'High-Touch Surface Disinfection',
        description: 'Disinfect all high-touch surfaces and equipment',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'bed-rails',
            title: 'Disinfect bed rails and controls',
            description: 'Clean and disinfect all bed surfaces and controls',
            isRequired: true,
            estimatedTime: 10,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['disinfection', 'high-touch', 'patient-care'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // CONSTRUCTION TEMPLATES
  {
    id: 'site-safety-check',
    name: 'Construction Site Safety Check',
    description: 'Daily construction site safety inspection',
    category: TEMPLATE_CATEGORIES[5],
    version: '1.0',
    tags: ['construction', 'site-safety', 'daily-inspection'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 60,
    difficulty: 'medium',
    requiredSkills: ['Construction Safety', 'OSHA 10'],
    sections: [
      {
        id: 'ppe-check',
        title: 'Personal Protective Equipment',
        description: 'Verify all workers have proper PPE',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'hard-hat-check',
            title: 'Verify hard hat compliance',
            description: 'Check that all workers are wearing approved hard hats',
            isRequired: true,
            estimatedTime: 10,
            requiresPhoto: true,
            tags: ['PPE', 'hard-hats', 'safety'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // HOSPITALITY TEMPLATES
  {
    id: 'hotel-room-turnover',
    name: 'Hotel Room Turnover',
    description: 'Complete hotel room cleaning and preparation for next guest',
    category: TEMPLATE_CATEGORIES[6],
    version: '1.0',
    tags: ['hotel', 'housekeeping', 'guest-services'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 30,
    difficulty: 'easy',
    requiredSkills: ['Housekeeping', 'Guest Services'],
    sections: [
      {
        id: 'room-cleaning',
        title: 'Room Cleaning & Setup',
        description: 'Clean and prepare room for next guest',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'bed-making',
            title: 'Make beds with fresh linens',
            description: 'Strip and remake beds with clean linens',
            isRequired: true,
            estimatedTime: 10,
            requiresPhoto: false,
            tags: ['housekeeping', 'linens', 'beds'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // ADDITIONAL CLEANING TEMPLATES
  {
    id: 'gym-cleaning',
    name: 'Gym Equipment Sanitization',
    description: 'Deep cleaning and sanitization of gym equipment and facilities',
    category: TEMPLATE_CATEGORIES[0],
    version: '1.0',
    tags: ['gym', 'fitness', 'sanitization', 'equipment'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 90,
    difficulty: 'medium',
    requiredSkills: ['Equipment Cleaning', 'Sanitization'],
    sections: [
      {
        id: 'equipment-sanitization',
        title: 'Equipment Deep Clean',
        description: 'Sanitize all gym equipment and high-touch surfaces',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'cardio-equipment',
            title: 'Clean cardio equipment',
            description: 'Deep clean treadmills, bikes, and ellipticals',
            isRequired: true,
            estimatedTime: 30,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['cardio', 'equipment', 'sanitization'],
            order: 1
          }),
          createTemplateItem({
            id: 'weight-equipment',
            title: 'Sanitize weight equipment',
            description: 'Clean and disinfect all weight machines and free weights',
            isRequired: true,
            estimatedTime: 45,
            requiresPhoto: true,
            tags: ['weights', 'sanitization'],
            order: 2
          })
        ],
        preConditions: []
      }
    ]
  },

  // ADDITIONAL SAFETY TEMPLATES
  {
    id: 'ladder-safety-inspection',
    name: 'Ladder Safety Inspection',
    description: 'Pre-use safety inspection for ladders and elevated work equipment',
    category: TEMPLATE_CATEGORIES[1],
    version: '1.0',
    tags: ['ladder', 'height-safety', 'equipment-inspection'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 15,
    difficulty: 'easy',
    requiredSkills: ['Safety Awareness', 'Equipment Inspection'],
    sections: [
      {
        id: 'ladder-inspection',
        title: 'Ladder Physical Inspection',
        description: 'Check ladder condition and safety features',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'rungs-check',
            title: 'Inspect ladder rungs',
            description: 'Check for cracks, bends, or damage to rungs',
            isRequired: true,
            estimatedTime: 5,
            requiresPhoto: true,
            tags: ['rungs', 'damage-assessment'],
            order: 1
          }),
          createTemplateItem({
            id: 'locks-check',
            title: 'Test safety locks',
            description: 'Verify all locks and hinges function properly',
            isRequired: true,
            estimatedTime: 5,
            requiresPhoto: true,
            tags: ['locks', 'functionality'],
            order: 2
          })
        ],
        preConditions: []
      }
    ]
  },

  // ADDITIONAL MAINTENANCE TEMPLATES
  {
    id: 'plumbing-maintenance',
    name: 'Plumbing System Maintenance',
    description: 'Routine plumbing inspection and preventive maintenance',
    category: TEMPLATE_CATEGORIES[2],
    version: '1.0',
    tags: ['plumbing', 'water-systems', 'maintenance'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 60,
    difficulty: 'medium',
    requiredSkills: ['Plumbing', 'Maintenance'],
    sections: [
      {
        id: 'fixtures-check',
        title: 'Fixture Inspection',
        description: 'Check all plumbing fixtures for leaks and proper operation',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'faucet-inspection',
            title: 'Inspect faucets and handles',
            description: 'Check for leaks, proper operation, and water pressure',
            isRequired: true,
            estimatedTime: 20,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['faucets', 'leaks', 'water-pressure'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // ADDITIONAL EVENT TEMPLATES
  {
    id: 'trade-show-setup',
    name: 'Trade Show Booth Setup',
    description: 'Complete trade show booth assembly and preparation',
    category: TEMPLATE_CATEGORIES[3],
    version: '1.0',
    tags: ['trade-show', 'booth', 'marketing'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 240,
    difficulty: 'hard',
    requiredSkills: ['Event Setup', 'Display Assembly'],
    sections: [
      {
        id: 'booth-assembly',
        title: 'Booth Structure Assembly',
        description: 'Assemble booth framework and displays',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'frame-assembly',
            title: 'Assemble booth frame',
            description: 'Set up booth framework according to floor plan',
            isRequired: true,
            estimatedTime: 90,
            requiresPhoto: true,
            tags: ['assembly', 'framework'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  },

  // ADDITIONAL HEALTHCARE TEMPLATES
  {
    id: 'or-prep',
    name: 'Operating Room Preparation',
    description: 'Pre-surgical operating room setup and sterile preparation',
    category: TEMPLATE_CATEGORIES[4],
    version: '1.0',
    tags: ['operating-room', 'sterile', 'surgical-prep'],
    isBuiltIn: true,
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    estimatedDuration: 45,
    difficulty: 'hard',
    requiredSkills: ['Sterile Technique', 'OR Procedures'],
    sections: [
      {
        id: 'sterile-prep',
        title: 'Sterile Environment Setup',
        description: 'Prepare sterile environment for surgical procedures',
        isOptional: false,
        order: 1,
        items: [
          createTemplateItem({
            id: 'sterile-field',
            title: 'Establish sterile field',
            description: 'Set up sterile drapes and instrument tables',
            isRequired: true,
            estimatedTime: 20,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['sterile-field', 'instruments'],
            order: 1
          })
        ],
        preConditions: []
      }
    ]
  }
];

// Helper function to create a standard checklist item
const createChecklistItem = (data: Partial<ChecklistItem> & { id: string; title: string }): ChecklistItem => ({
  id: data.id,
  text: data.title, // Map title to text field
  description: data.description || '',
  isRequired: data.isRequired ?? true,
  isOptional: data.isOptional ?? false,
  isCompleted: false,
  notes: '',
  attachments: [],
  estimatedTime: data.estimatedTime || 5,
  requiresPhoto: data.requiresPhoto ?? false,
  requiresNotes: data.requiresNotes ?? false,
  tags: data.tags || [],
  instructions: data.instructions,
  warningMessage: data.warningMessage,
  dependencies: data.dependencies || [],
  templateItemId: data.templateItemId,
  isSkipped: false
});

// Cleaning Template
export const CLEANING_TEMPLATE: ChecklistTemplate = {
  id: 'cleaning-template-001',
  name: 'Professional Cleaning Pre-Work',
  description: 'Comprehensive pre-work checklist for cleaning and maintenance projects',
  category: TEMPLATE_CATEGORIES[0],
  version: '1.0.0',
  tags: ['cleaning', 'maintenance', 'documentation', 'safety'],
  isBuiltIn: true,
  createdAt: new Date(),
  lastModified: new Date(),
  estimatedDuration: 45, // minutes
  difficulty: 'medium',
  requiredSkills: ['Basic photography', 'Property assessment', 'Safety awareness'],
  sections: [
    {
      id: 'walkthrough-section',
      title: 'Walkthrough & Video Documentation',
      description: 'Initial property assessment and documentation',
      isOptional: false,
      order: 1,
      items: [
        {
          id: 'property-walkthrough-item',
          title: 'Complete Property Walkthrough',
          description: 'Document all areas requiring attention',
          isRequired: true,
          isOptional: false,
          order: 1,
          estimatedTime: 15,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['walkthrough', 'assessment'],
          instructions: 'Walk through all accessible areas of the property. Take notes on general condition, areas of concern, and scope of work needed.',
          dependencies: []
        },
        {
          id: 'video-documentation-item',
          title: 'Record Video Documentation',
          description: 'Capture before/during/after footage',
          isRequired: true,
          isOptional: false,
          order: 2,
          estimatedTime: 10,
          requiresPhoto: false,
          requiresNotes: true,
          tags: ['video', 'documentation'],
          instructions: 'Record a video tour of the property focusing on areas that will be cleaned or maintained.',
          dependencies: ['property-walkthrough-item']
        },
        {
          id: 'initial-assessment-item',
          title: 'Initial Property Assessment',
          description: 'Evaluate overall condition and scope of work',
          isRequired: true,
          isOptional: false,
          order: 3,
          estimatedTime: 10,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['assessment', 'evaluation'],
          instructions: 'Provide written assessment of property condition and preliminary work plan.',
          dependencies: ['property-walkthrough-item']
        }
      ]
    },
    {
      id: 'issues-section',
      title: 'Report Immediate Issues',
      description: 'Document and flag urgent concerns',
      isOptional: false,
      order: 2,
      items: [
        {
          id: 'safety-hazards-item',
          title: 'Identify Safety Hazards',
          description: 'Document any immediate safety concerns',
          isRequired: true,
          isOptional: false,
          order: 1,
          estimatedTime: 5,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['safety', 'hazards'],
          warningMessage: 'Do not proceed with work if serious safety hazards are present. Contact supervisor immediately.',
          instructions: 'Look for electrical hazards, structural damage, mold, asbestos, or other safety concerns.',
          dependencies: []
        },
        {
          id: 'damage-assessment-item',
          title: 'Document Property Damage',
          description: 'Record existing damage before work begins',
          isRequired: true,
          isOptional: false,
          order: 2,
          estimatedTime: 10,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['damage', 'documentation'],
          instructions: 'Photograph and document all existing damage to avoid liability issues.',
          dependencies: []
        }
      ]
    }
  ]
};

export const CLEANING_PREWORK_TEMPLATE: PreWorkChecklist = {
  id: 'cleaning-prework-001',
  title: 'Cleaning Pre-Work Checklist',
  description: 'Comprehensive pre-work checklist for cleaning and maintenance projects',
  createdAt: new Date(),
  lastModified: new Date(),
  progress: 0,
  isCompleted: false,
  templateId: 'cleaning-template-001',
  templateVersion: '1.0.0',
  category: TEMPLATE_CATEGORIES[0],
  tags: ['cleaning', 'maintenance', 'documentation', 'safety'],
  priority: 'medium',
  estimatedDuration: 45,
  sections: [
    {
      id: 'walkthrough-video',
      title: 'Walkthrough & Video Documentation',
      description: 'Initial property assessment and documentation',
      isCollapsed: false,
      completedCount: 0,
      totalCount: 3,
      isOptional: false,
      order: 1,
      templateSectionId: 'walkthrough-section',
      estimatedTime: 35,
      items: [
        createChecklistItem({
          id: 'property-walkthrough',
          title: 'Complete Property Walkthrough',
          description: 'Document all areas requiring attention',
          isRequired: true,
          estimatedTime: 15,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['walkthrough', 'assessment'],
          instructions: 'Walk through all accessible areas of the property. Take notes on general condition, areas of concern, and scope of work needed.',
          templateItemId: 'property-walkthrough-item'
        }),
        createChecklistItem({
          id: 'video-documentation',
          title: 'Record Video Documentation',
          description: 'Capture before/during/after footage',
          isRequired: true,
          estimatedTime: 10,
          requiresPhoto: false,
          requiresNotes: true,
          tags: ['video', 'documentation'],
          instructions: 'Record a video tour of the property focusing on areas that will be cleaned or maintained.',
          dependencies: ['property-walkthrough'],
          templateItemId: 'video-documentation-item'
        }),
        createChecklistItem({
          id: 'initial-assessment',
          title: 'Initial Property Assessment',
          description: 'Evaluate overall condition and scope of work',
          isRequired: true,
          estimatedTime: 10,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['assessment', 'evaluation'],
          instructions: 'Provide written assessment of property condition and preliminary work plan.',
          dependencies: ['property-walkthrough'],
          templateItemId: 'initial-assessment-item'
        })
      ]
    },
    {
      id: 'report-issues',
      title: 'Report Immediate Issues',
      description: 'Document and flag urgent concerns',
      isCollapsed: false,
      completedCount: 0,
      totalCount: 4,
      isOptional: false,
      order: 2,
      templateSectionId: 'issues-section',
      estimatedTime: 25,
      items: [
        createChecklistItem({
          id: 'safety-hazards',
          title: 'Identify Safety Hazards',
          description: 'Document any immediate safety concerns',
          isRequired: true,
          estimatedTime: 5,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['safety', 'hazards'],
          warningMessage: 'Do not proceed with work if serious safety hazards are present. Contact supervisor immediately.',
          instructions: 'Look for electrical hazards, structural damage, mold, asbestos, or other safety concerns.',
          templateItemId: 'safety-hazards-item'
        }),
        createChecklistItem({
          id: 'damage-assessment',
          title: 'Document Property Damage',
          description: 'Record existing damage before work begins',
          isRequired: true,
          estimatedTime: 10,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['damage', 'documentation'],
          instructions: 'Photograph and document all existing damage to avoid liability issues.',
          templateItemId: 'damage-assessment-item'
        }),
        createChecklistItem({
          id: 'emergency-issues',
          title: 'Emergency Repairs Needed',
          description: 'Identify any urgent repairs required',
          isRequired: false,
          isOptional: true,
          estimatedTime: 5,
          requiresPhoto: true,
          requiresNotes: true,
          tags: ['repairs', 'emergency'],
          instructions: 'Note any repairs that must be completed before cleaning can begin.',
          dependencies: ['damage-assessment'],
          templateItemId: 'emergency-repairs-item'
        }),
        createChecklistItem({
          id: 'contact-management',
          title: 'Contact Management if Critical',
          description: 'Notify supervisors of critical issues',
          isRequired: false,
          isOptional: true,
          estimatedTime: 5,
          requiresPhoto: false,
          requiresNotes: true,
          tags: ['communication', 'escalation'],
          instructions: 'Call or message supervisor immediately for critical safety issues or major damage.',
          dependencies: ['safety-hazards'],
          templateItemId: 'contact-management-item'
        })
      ]
    }
  ]
};

export const createNewChecklist = (title: string = 'New Checklist'): PreWorkChecklist => ({
  id: `checklist-${Date.now()}`,
  title,
  description: 'Custom checklist created by user',
  createdAt: new Date(),
  lastModified: new Date(),
  progress: 0,
  isCompleted: false,
  tags: [],
  priority: 'medium',
  sections: []
});

export const calculateProgress = (checklist: PreWorkChecklist) => {
  const allItems = checklist.sections.flatMap(section => section.items);
  const totalItems = allItems.length;
  const completedItems = allItems.filter(item => item.isCompleted).length;
  const requiredItems = allItems.filter(item => item.isRequired).length;
  const completedRequiredItems = allItems.filter(item => item.isRequired && item.isCompleted).length;
  const optionalItems = allItems.filter(item => item.isOptional).length;
  const completedOptionalItems = allItems.filter(item => item.isOptional && item.isCompleted).length;
  const skippedItems = allItems.filter(item => item.isSkipped).length;

  return {
    totalItems,
    completedItems,
    requiredItems,
    completedRequiredItems,
    optionalItems,
    completedOptionalItems,
    skippedItems,
    percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    requiredPercentage: requiredItems > 0 ? Math.round((completedRequiredItems / requiredItems) * 100) : 0,
    optionalPercentage: optionalItems > 0 ? Math.round((completedOptionalItems / optionalItems) * 100) : 0,
    sectionsCompleted: checklist.sections.filter(section => 
      section.items.every(item => item.isCompleted || item.isSkipped)
    ).length,
    totalSections: checklist.sections.length,
    criticalItemsCompleted: allItems.filter(item => 
      item.isRequired && item.isCompleted
    ).length,
    totalCriticalItems: allItems.filter(item => item.isRequired).length
  };
};

export const presetChecklists = [CLEANING_PREWORK_TEMPLATE];
export const presetTemplates = [CLEANING_TEMPLATE];