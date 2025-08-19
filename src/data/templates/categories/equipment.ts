import { ChecklistTemplate } from '../../../types';

export const EQUIPMENT_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'hvac-maintenance',
    name: 'HVAC System Maintenance',
    description: 'Comprehensive HVAC system maintenance and inspection',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['hvac', 'maintenance', 'systems', 'climate-control'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'hvac-maintenance-process',
        title: 'HVAC Maintenance Process',
        description: 'Systematic HVAC system maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'filter-replacement',
            title: 'Replace air filters',
            description: 'Check and replace HVAC air filters as needed',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['filters', 'replacement'],
            dependencies: []
          },
          {
            id: 'system-calibration',
            title: 'Calibrate system controls',
            description: 'Check and calibrate thermostat and control systems',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['calibration', 'controls'],
            dependencies: ['filter-replacement']
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['HVAC systems', 'mechanical maintenance', 'system diagnostics']
  },
  {
    id: 'kitchen-equipment-maintenance',
    name: 'Commercial Kitchen Equipment Maintenance',
    description: 'Maintenance procedures for commercial kitchen equipment',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['kitchen', 'commercial', 'equipment', 'food-service'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'kitchen-maintenance',
        title: 'Kitchen Equipment Maintenance',
        description: 'Commercial kitchen equipment care',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'deep-fryer-maintenance',
            title: 'Maintain deep fryer systems',
            description: 'Clean and maintain commercial deep fryer equipment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['deep-fryer', 'cleaning'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['commercial kitchen equipment', 'food safety', 'equipment maintenance']
  },
  {
    id: 'generator-maintenance',
    name: 'Emergency Generator Maintenance',
    description: 'Routine maintenance for emergency backup generators',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['generator', 'emergency', 'backup-power', 'maintenance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'generator-maintenance',
        title: 'Generator Maintenance Process',
        description: 'Emergency generator maintenance procedures',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'fuel-system-check',
            title: 'Check fuel system',
            description: 'Inspect fuel lines, tank, and fuel quality',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['fuel-system', 'inspection'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 150,
    difficulty: 'hard',
    requiredSkills: ['generator systems', 'electrical safety', 'fuel systems']
  },
  {
    id: 'elevator-maintenance',
    name: 'Elevator System Maintenance',
    description: 'Routine elevator maintenance and safety inspection',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['elevator', 'vertical-transport', 'safety', 'mechanical'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'elevator-maintenance',
        title: 'Elevator Maintenance Process',
        description: 'Comprehensive elevator system maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'cable-inspection',
            title: 'Inspect elevator cables',
            description: 'Check elevator cables for wear and proper tension',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['cables', 'safety-inspection'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 200,
    difficulty: 'hard',
    requiredSkills: ['elevator systems', 'mechanical maintenance', 'safety protocols']
  },
  {
    id: 'pump-system-maintenance',
    name: 'Pump System Maintenance',
    description: 'Water and fluid pump system maintenance procedures',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['pumps', 'fluid-systems', 'mechanical', 'water'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'pump-maintenance',
        title: 'Pump Maintenance Process',
        description: 'Systematic pump system maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'impeller-inspection',
            title: 'Inspect pump impeller',
            description: 'Check pump impeller for wear and proper operation',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['impeller', 'mechanical-inspection'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['pump systems', 'mechanical maintenance', 'fluid dynamics']
  },
  {
    id: 'compressor-maintenance',
    name: 'Air Compressor Maintenance',
    description: 'Routine maintenance for air compressor systems',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['compressor', 'air-systems', 'pneumatic', 'maintenance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'compressor-maintenance',
        title: 'Compressor Maintenance Process',
        description: 'Air compressor system maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pressure-check',
            title: 'Check system pressure',
            description: 'Verify proper system pressure and safety valves',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pressure', 'safety-valves'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 100,
    difficulty: 'medium',
    requiredSkills: ['compressor systems', 'pneumatics', 'pressure systems']
  },
  {
    id: 'conveyor-maintenance',
    name: 'Conveyor System Maintenance',
    description: 'Maintenance procedures for conveyor belt systems',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['conveyor', 'material-handling', 'mechanical', 'belt-systems'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'conveyor-maintenance',
        title: 'Conveyor Maintenance Process',
        description: 'Conveyor belt system maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'belt-tension',
            title: 'Check belt tension',
            description: 'Verify proper conveyor belt tension and alignment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['belt-tension', 'alignment'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'medium',
    requiredSkills: ['conveyor systems', 'mechanical maintenance', 'material handling']
  },
  {
    id: 'boiler-maintenance',
    name: 'Boiler System Maintenance',
    description: 'Comprehensive boiler system maintenance and safety inspection',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['boiler', 'steam-systems', 'heating', 'pressure-vessel'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'boiler-maintenance',
        title: 'Boiler Maintenance Process',
        description: 'Boiler system safety and maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pressure-relief-check',
            title: 'Check pressure relief valves',
            description: 'Test and inspect boiler pressure relief safety systems',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pressure-relief', 'safety-systems'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'hard',
    requiredSkills: ['boiler systems', 'pressure vessel safety', 'steam systems']
  },
  {
    id: 'compressor-maintenance',
    name: 'Air Compressor Maintenance',
    description: 'Industrial air compressor maintenance and repair',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['maintenance', 'compressor', 'pneumatic', 'industrial'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'compressor-maintenance-process',
        title: 'Compressor Maintenance Process',
        description: 'Air compressor maintenance and performance check',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'oil-change',
            title: 'Change compressor oil',
            description: 'Replace compressor oil and check lubrication system',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['oil-change', 'lubrication'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['compressor systems', 'pneumatic maintenance', 'mechanical repair']
  },
  {
    id: 'pump-maintenance',
    name: 'Pump System Maintenance',
    description: 'Water and fluid pump maintenance and repair',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['maintenance', 'pump', 'water', 'fluid-systems'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'pump-maintenance-process',
        title: 'Pump Maintenance Process',
        description: 'Pump system maintenance and performance check',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'seal-inspection',
            title: 'Inspect seals and gaskets',
            description: 'Check for leaks and replace worn seals and gaskets',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['seals', 'leak-prevention'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 150,
    difficulty: 'medium',
    requiredSkills: ['pump systems', 'hydraulic maintenance', 'seal replacement']
  },
  {
    id: 'conveyor-maintenance',
    name: 'Conveyor Belt Maintenance',
    description: 'Industrial conveyor system maintenance and alignment',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['maintenance', 'conveyor', 'belt', 'industrial'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'conveyor-maintenance-process',
        title: 'Conveyor Maintenance Process',
        description: 'Conveyor belt maintenance and adjustment',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'belt-alignment',
            title: 'Check belt alignment and tension',
            description: 'Adjust belt tracking and tension for optimal operation',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['alignment', 'tension'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['conveyor systems', 'belt maintenance', 'mechanical adjustment']
  },
  {
    id: 'forklift-maintenance',
    name: 'Forklift Maintenance Service',
    description: 'Forklift safety inspection and maintenance procedures',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['maintenance', 'forklift', 'safety', 'material-handling'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'forklift-maintenance-process',
        title: 'Forklift Maintenance Process',
        description: 'Forklift safety and maintenance inspection',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'hydraulic-system',
            title: 'Check hydraulic system',
            description: 'Inspect hydraulic fluid levels and test lift mechanisms',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['hydraulics', 'lift-mechanism'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['forklift maintenance', 'hydraulic systems', 'safety inspection']
  },
  {
    id: 'crane-maintenance',
    name: 'Crane Maintenance Inspection',
    description: 'Overhead crane safety and maintenance inspection',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['maintenance', 'crane', 'overhead', 'safety'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'crane-maintenance-process',
        title: 'Crane Maintenance Process',
        description: 'Crane safety and operational maintenance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'wire-rope-inspection',
            title: 'Inspect wire ropes and cables',
            description: 'Check for wear, fraying, and proper lubrication of cables',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['wire-rope', 'cables'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'hard',
    requiredSkills: ['crane operations', 'rigging safety', 'mechanical inspection']
  },
  {
    id: 'welding-equipment-maintenance',
    name: 'Welding Equipment Maintenance',
    description: 'Welding equipment safety and maintenance service',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['maintenance', 'welding', 'electrical', 'safety'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'welding-maintenance-process',
        title: 'Welding Equipment Maintenance',
        description: 'Welding equipment safety and performance check',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'electrical-connections',
            title: 'Check electrical connections',
            description: 'Inspect all electrical connections and grounding systems',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['electrical', 'grounding'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'medium',
    requiredSkills: ['welding equipment', 'electrical safety', 'equipment calibration']
  },
  {
    id: 'power-tool-maintenance',
    name: 'Power Tool Maintenance Service',
    description: 'Power tool inspection, calibration, and safety check',
    category: {
      id: 'equipment-maintenance',
      name: 'Equipment Maintenance',
      description: 'Equipment maintenance and repair procedures',
      isActive: true
    },
    version: '1.0.0',
    tags: ['maintenance', 'power-tools', 'safety', 'calibration'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'tool-maintenance-process',
        title: 'Tool Maintenance Process',
        description: 'Power tool maintenance and safety verification',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'guard-inspection',
            title: 'Check safety guards and switches',
            description: 'Verify all safety guards and emergency switches function properly',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['safety-guards', 'switches'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 60,
    difficulty: 'easy',
    requiredSkills: ['tool maintenance', 'safety inspection', 'equipment testing']
  }
];
