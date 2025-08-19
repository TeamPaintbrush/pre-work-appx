import { ChecklistTemplate } from '../../../types';

export const CLEANING_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'deep-home-cleaning',
    name: 'Deep Home Cleaning',
    description: 'Comprehensive deep cleaning for entire home',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'deep-clean', 'residential', 'thorough'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'full-house-clean',
        title: 'Full House Deep Clean',
        description: 'Room by room deep cleaning process',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'living-areas',
            title: 'Clean living areas thoroughly',
            description: 'Deep clean all living spaces including dusting, vacuuming, and mopping',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['living-room', 'deep-clean'],
            dependencies: []
          },
          {
            id: 'bathrooms',
            title: 'Sanitize bathrooms completely',
            description: 'Deep clean and sanitize all bathroom fixtures and surfaces',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['bathroom', 'sanitization'],
            dependencies: []
          },
          {
            id: 'kitchen',
            title: 'Deep clean kitchen',
            description: 'Thorough cleaning of kitchen appliances, counters, and cabinets',
            isRequired: true,
            isOptional: false,
            order: 3,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['kitchen', 'appliances'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 360,
    difficulty: 'medium',
    requiredSkills: ['cleaning', 'organization', 'time management']
  },
  {
    id: 'office-cleaning',
    name: 'Office Deep Cleaning',
    description: 'Professional office space cleaning',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'office', 'commercial', 'professional'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'office-clean-process',
        title: 'Office Cleaning Process',
        description: 'Systematic office cleaning workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'workstations',
            title: 'Clean all workstations',
            description: 'Sanitize desks, keyboards, monitors, and office equipment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['workstation', 'sanitization'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'easy',
    requiredSkills: ['cleaning', 'attention to detail']
  },
  {
    id: 'carpet-cleaning',
    name: 'Professional Carpet Cleaning',
    description: 'Deep carpet cleaning and stain removal',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'carpet', 'stain-removal', 'deep-clean'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'carpet-cleaning-process',
        title: 'Carpet Cleaning Process',
        description: 'Professional carpet cleaning steps',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pre-treatment',
            title: 'Apply pre-treatment solution',
            description: 'Apply appropriate pre-treatment for stains and high-traffic areas',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pre-treatment', 'stains'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['carpet cleaning', 'stain treatment']
  },
  {
    id: 'window-cleaning',
    name: 'Professional Window Cleaning',
    description: 'Interior and exterior window cleaning service',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'windows', 'exterior', 'interior'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'window-cleaning-process',
        title: 'Window Cleaning Process',
        description: 'Professional window cleaning workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'clean-windows',
            title: 'Clean all windows thoroughly',
            description: 'Clean both interior and exterior window surfaces for streak-free results',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['windows', 'streak-free'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'easy',
    requiredSkills: ['window cleaning', 'ladder safety']
  },
  {
    id: 'post-construction-cleaning',
    name: 'Post-Construction Cleanup',
    description: 'Thorough cleaning after construction or renovation',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'construction', 'renovation', 'debris'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'construction-cleanup',
        title: 'Construction Cleanup Process',
        description: 'Systematic post-construction cleaning',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'debris-removal',
            title: 'Remove construction debris',
            description: 'Clear all construction debris and materials from work area',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['debris', 'cleanup'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['cleaning', 'debris removal', 'safety protocols']
  },
  {
    id: 'move-in-cleaning',
    name: 'Move-In Deep Cleaning',
    description: 'Complete cleaning service for new residence',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'move-in', 'deep-clean', 'sanitization'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'move-in-prep',
        title: 'Move-In Preparation',
        description: 'Prepare home for new occupants',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'sanitize-all',
            title: 'Sanitize entire property',
            description: 'Complete sanitization of all surfaces and fixtures',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['sanitization', 'deep-clean'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 300,
    difficulty: 'medium',
    requiredSkills: ['cleaning', 'sanitization', 'attention to detail']
  },
  {
    id: 'move-out-cleaning',
    name: 'Move-Out Deep Cleaning',
    description: 'Thorough cleaning for property handover',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'move-out', 'deposit', 'handover'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'move-out-prep',
        title: 'Move-Out Preparation',
        description: 'Prepare property for handover',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'restore-condition',
            title: 'Restore original condition',
            description: 'Clean property to original condition for deposit return',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['restoration', 'deposit'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 360,
    difficulty: 'medium',
    requiredSkills: ['cleaning', 'restoration', 'property standards']
  },
  {
    id: 'kitchen-deep-clean',
    name: 'Kitchen Deep Cleaning',
    description: 'Comprehensive kitchen cleaning and sanitization',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'kitchen', 'appliances', 'sanitization'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'kitchen-process',
        title: 'Kitchen Cleaning Process',
        description: 'Systematic kitchen deep cleaning',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'appliance-cleaning',
            title: 'Deep clean all appliances',
            description: 'Thoroughly clean oven, refrigerator, dishwasher, and microwave',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['appliances', 'deep-clean'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['cleaning', 'appliance maintenance', 'food safety']
  },
  {
    id: 'bathroom-deep-clean',
    name: 'Bathroom Deep Cleaning',
    description: 'Complete bathroom sanitization and cleaning',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'bathroom', 'sanitization', 'hygiene'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'bathroom-process',
        title: 'Bathroom Cleaning Process',
        description: 'Complete bathroom cleaning workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'sanitize-fixtures',
            title: 'Sanitize all bathroom fixtures',
            description: 'Deep clean and sanitize toilet, shower, bathtub, and sink',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['fixtures', 'sanitization'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'easy',
    requiredSkills: ['cleaning', 'sanitization', 'hygiene protocols']
  },
  {
    id: 'upholstery-cleaning',
    name: 'Professional Upholstery Cleaning',
    description: 'Deep cleaning for furniture and upholstered items',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'upholstery', 'furniture', 'stain-removal'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'upholstery-process',
        title: 'Upholstery Cleaning Process',
        description: 'Professional upholstery cleaning steps',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'fabric-treatment',
            title: 'Apply appropriate fabric treatment',
            description: 'Use proper cleaning method based on upholstery fabric type',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['fabric', 'treatment'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 150,
    difficulty: 'medium',
    requiredSkills: ['upholstery cleaning', 'fabric identification', 'stain treatment']
  },
  {
    id: 'commercial-cleaning',
    name: 'Commercial Space Cleaning',
    description: 'Professional cleaning for commercial properties',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'commercial', 'office', 'retail'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'commercial-process',
        title: 'Commercial Cleaning Process',
        description: 'Systematic commercial space cleaning',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'common-areas',
            title: 'Clean common areas thoroughly',
            description: 'Maintain lobbies, hallways, restrooms, and common spaces',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['common-areas', 'maintenance'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['commercial cleaning', 'time management', 'professional standards']
  },
  {
    id: 'air-duct-cleaning',
    name: 'Air Duct System Cleaning',
    description: 'Professional HVAC and air duct cleaning service',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'hvac', 'air-ducts', 'ventilation'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'duct-cleaning-process',
        title: 'Air Duct Cleaning Process',
        description: 'Professional air duct cleaning workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'duct-inspection',
            title: 'Inspect air duct system',
            description: 'Thoroughly inspect ductwork for debris, mold, and blockages',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['inspection', 'ductwork'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'hard',
    requiredSkills: ['HVAC knowledge', 'specialized equipment', 'safety protocols']
  },
  {
    id: 'spring-cleaning-service',
    name: 'Spring Cleaning Service',
    description: 'Comprehensive seasonal spring cleaning for residential homes',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'seasonal', 'spring', 'thorough'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'spring-cleaning-process',
        title: 'Spring Cleaning Process',
        description: 'Seasonal deep cleaning and organization',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'declutter-organize',
            title: 'Declutter and organize all spaces',
            description: 'Remove unnecessary items and organize remaining belongings',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['organization', 'decluttering'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 480,
    difficulty: 'medium',
    requiredSkills: ['organization', 'deep cleaning', 'time management']
  },
  {
    id: 'apartment-cleaning',
    name: 'Apartment Deep Cleaning',
    description: 'Complete apartment cleaning service for small living spaces',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'apartment', 'small-space', 'residential'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'apartment-clean-process',
        title: 'Apartment Cleaning Process',
        description: 'Efficient cleaning for compact living spaces',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'maximize-space',
            title: 'Maximize space efficiency',
            description: 'Clean and organize to maximize available space',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['space-efficiency', 'organization'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'easy',
    requiredSkills: ['efficient cleaning', 'small space organization']
  },
  {
    id: 'vacation-rental-cleaning',
    name: 'Vacation Rental Turnover',
    description: 'Quick and thorough cleaning between vacation rental guests',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'vacation-rental', 'turnover', 'hospitality'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'rental-turnover',
        title: 'Rental Turnover Process',
        description: 'Fast and comprehensive guest turnover cleaning',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'guest-ready',
            title: 'Prepare for next guests',
            description: 'Ensure property is spotless and guest-ready',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['guest-ready', 'hospitality'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['speed cleaning', 'attention to detail', 'hospitality standards']
  },
  {
    id: 'basement-cleaning',
    name: 'Basement Deep Cleaning',
    description: 'Thorough basement cleaning and organization service',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'basement', 'storage', 'organization'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'basement-clean-process',
        title: 'Basement Cleaning Process',
        description: 'Deep clean and organize basement space',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'moisture-check',
            title: 'Check for moisture and mold',
            description: 'Inspect and address any moisture or mold issues',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['moisture', 'mold-prevention'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['basement cleaning', 'moisture detection', 'organization']
  },
  {
    id: 'attic-cleaning',
    name: 'Attic Cleaning & Organization',
    description: 'Complete attic cleaning and storage organization',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'attic', 'storage', 'dust-removal'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'attic-clean-process',
        title: 'Attic Cleaning Process',
        description: 'Safe attic cleaning and organization',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'dust-removal',
            title: 'Remove dust and debris',
            description: 'Safely remove accumulated dust and debris from attic space',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['dust-removal', 'safety'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'hard',
    requiredSkills: ['confined space cleaning', 'safety protocols', 'dust control']
  },
  {
    id: 'garage-cleaning',
    name: 'Garage Deep Cleaning',
    description: 'Comprehensive garage cleaning and organization service',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'garage', 'organization', 'storage'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'garage-clean-process',
        title: 'Garage Cleaning Process',
        description: 'Deep clean and organize garage space',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'floor-cleaning',
            title: 'Clean garage floor thoroughly',
            description: 'Remove stains and deep clean garage floor surfaces',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['floor-cleaning', 'stain-removal'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 200,
    difficulty: 'medium',
    requiredSkills: ['garage organization', 'stain removal', 'tool organization']
  },
  {
    id: 'eco-friendly-cleaning',
    name: 'Eco-Friendly Home Cleaning',
    description: 'Environmentally conscious cleaning using green products',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'eco-friendly', 'green', 'sustainable'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'eco-clean-process',
        title: 'Eco-Friendly Cleaning Process',
        description: 'Green cleaning methods and products',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'green-products',
            title: 'Use eco-friendly cleaning products',
            description: 'Apply environmentally safe cleaning products throughout home',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['eco-friendly', 'green-products'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'easy',
    requiredSkills: ['eco-friendly cleaning', 'green product knowledge', 'sustainable practices']
  },
  {
    id: 'holiday-cleaning',
    name: 'Holiday Preparation Cleaning',
    description: 'Special cleaning service to prepare home for holiday gatherings',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'holiday', 'entertaining', 'special-occasion'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'holiday-prep',
        title: 'Holiday Preparation Process',
        description: 'Prepare home for holiday entertaining',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'guest-areas',
            title: 'Focus on guest areas',
            description: 'Prioritize cleaning areas where guests will spend time',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['guest-areas', 'entertaining'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 300,
    difficulty: 'medium',
    requiredSkills: ['detail cleaning', 'hospitality preparation', 'time management']
  },
  {
    id: 'garage-cleaning',
    name: 'Garage Deep Cleaning',
    description: 'Complete garage organization and cleaning service',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'garage', 'organization', 'residential'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'garage-clean-process',
        title: 'Garage Cleaning Process',
        description: 'Systematic garage cleaning and organization',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'declutter-garage',
            title: 'Declutter and organize garage',
            description: 'Sort items, dispose of unwanted materials, and organize remaining items',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['decluttering', 'organization'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['organization', 'heavy lifting', 'sorting']
  },
  {
    id: 'basement-cleaning',
    name: 'Basement Deep Cleaning',
    description: 'Comprehensive basement cleaning and dehumidification',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'basement', 'moisture-control', 'residential'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'basement-clean-process',
        title: 'Basement Cleaning Process',
        description: 'Deep basement cleaning and moisture control',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'moisture-check',
            title: 'Check for moisture and mold',
            description: 'Inspect for water damage, mold, and humidity issues',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['moisture', 'inspection'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 300,
    difficulty: 'hard',
    requiredSkills: ['mold detection', 'moisture control', 'deep cleaning']
  },
  {
    id: 'attic-cleaning',
    name: 'Attic Cleaning Service',
    description: 'Attic cleaning, insulation check, and pest control',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'attic', 'insulation', 'pest-control'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'attic-clean-process',
        title: 'Attic Cleaning Process',
        description: 'Complete attic cleaning and maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pest-inspection',
            title: 'Inspect for pests and droppings',
            description: 'Check for rodents, insects, and animal intrusions',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pest-control', 'inspection'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'hard',
    requiredSkills: ['confined space work', 'pest identification', 'insulation handling']
  },
  {
    id: 'laundry-room-cleaning',
    name: 'Laundry Room Deep Clean',
    description: 'Comprehensive laundry room cleaning and maintenance',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'laundry-room', 'appliances', 'residential'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'laundry-clean-process',
        title: 'Laundry Room Cleaning Process',
        description: 'Deep clean laundry room and appliances',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'appliance-maintenance',
            title: 'Clean and maintain appliances',
            description: 'Deep clean washer, dryer, and lint removal',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['appliances', 'maintenance'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['appliance cleaning', 'lint removal', 'ventilation cleaning']
  },
  {
    id: 'outdoor-patio-cleaning',
    name: 'Outdoor Patio & Deck Cleaning',
    description: 'Pressure washing and maintenance for outdoor living spaces',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'outdoor', 'patio', 'pressure-washing'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'outdoor-clean-process',
        title: 'Outdoor Cleaning Process',
        description: 'Comprehensive outdoor space cleaning',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pressure-wash',
            title: 'Pressure wash surfaces',
            description: 'Power wash decks, patios, and outdoor furniture',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pressure-washing', 'outdoor'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['pressure washing', 'outdoor cleaning', 'surface restoration']
  },
  {
    id: 'pool-area-cleaning',
    name: 'Pool Area Cleaning',
    description: 'Complete pool area and equipment cleaning service',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'pool', 'outdoor', 'equipment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'pool-clean-process',
        title: 'Pool Area Cleaning Process',
        description: 'Comprehensive pool area maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pool-equipment',
            title: 'Clean pool equipment and area',
            description: 'Clean filters, skimmers, and surrounding pool deck',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pool-equipment', 'maintenance'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 150,
    difficulty: 'medium',
    requiredSkills: ['pool maintenance', 'equipment cleaning', 'chemical handling']
  },
  {
    id: 'driveway-cleaning',
    name: 'Driveway & Walkway Cleaning',
    description: 'Pressure washing and stain removal for driveways and walkways',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'driveway', 'pressure-washing', 'stain-removal'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'driveway-clean-process',
        title: 'Driveway Cleaning Process',
        description: 'Professional driveway and walkway cleaning',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'stain-treatment',
            title: 'Treat oil stains and discoloration',
            description: 'Apply stain remover and pressure wash concrete surfaces',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['stain-removal', 'concrete'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'easy',
    requiredSkills: ['pressure washing', 'stain treatment', 'concrete cleaning']
  },
  {
    id: 'chimney-fireplace-cleaning',
    name: 'Chimney & Fireplace Cleaning',
    description: 'Professional chimney inspection and fireplace cleaning',
    category: {
      id: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      description: 'Comprehensive cleaning and maintenance services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cleaning', 'chimney', 'fireplace', 'safety'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'chimney-clean-process',
        title: 'Chimney Cleaning Process',
        description: 'Professional chimney and fireplace maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'soot-removal',
            title: 'Remove soot and creosote buildup',
            description: 'Clean chimney flue and remove dangerous buildup',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['soot-removal', 'safety'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'hard',
    requiredSkills: ['chimney cleaning', 'safety protocols', 'specialized equipment']
  }
];
