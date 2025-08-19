import { ChecklistTemplate } from '../../../types';

export const SAFETY_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'workplace-safety-inspection',
    name: 'Workplace Safety Inspection',
    description: 'Comprehensive workplace safety compliance inspection',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['safety', 'workplace', 'inspection', 'compliance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'safety-inspection-process',
        title: 'Safety Inspection Process',
        description: 'Systematic workplace safety evaluation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'hazard-identification',
            title: 'Identify potential hazards',
            description: 'Conduct thorough hazard identification and risk assessment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['hazards', 'risk-assessment'],
            dependencies: []
          },
          {
            id: 'safety-equipment',
            title: 'Check safety equipment',
            description: 'Verify all safety equipment is present and functional',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['equipment', 'compliance'],
            dependencies: ['hazard-identification']
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['safety protocols', 'risk assessment', 'compliance knowledge']
  },
  {
    id: 'fire-safety-inspection',
    name: 'Fire Safety Inspection',
    description: 'Complete fire safety system inspection and compliance check',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['fire-safety', 'inspection', 'compliance', 'emergency'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'fire-safety-check',
        title: 'Fire Safety Check',
        description: 'Comprehensive fire safety system evaluation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'fire-extinguishers',
            title: 'Inspect fire extinguishers',
            description: 'Check all fire extinguishers for proper placement and maintenance',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['fire-extinguishers', 'maintenance'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'medium',
    requiredSkills: ['fire safety', 'emergency procedures', 'inspection protocols']
  },
  {
    id: 'electrical-safety-inspection',
    name: 'Electrical Safety Inspection',
    description: 'Electrical systems safety inspection and compliance verification',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['electrical', 'safety', 'inspection', 'systems'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'electrical-inspection',
        title: 'Electrical Safety Inspection',
        description: 'Comprehensive electrical system safety check',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'wiring-inspection',
            title: 'Inspect electrical wiring',
            description: 'Check all electrical wiring for safety and code compliance',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['wiring', 'electrical-code'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 150,
    difficulty: 'hard',
    requiredSkills: ['electrical knowledge', 'safety codes', 'inspection techniques']
  },
  {
    id: 'chemical-safety-inspection',
    name: 'Chemical Safety Inspection',
    description: 'Chemical storage and handling safety inspection',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['chemical', 'safety', 'storage', 'handling'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'chemical-safety-check',
        title: 'Chemical Safety Check',
        description: 'Chemical storage and handling safety evaluation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'chemical-storage',
            title: 'Inspect chemical storage',
            description: 'Verify proper chemical storage and labeling procedures',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['storage', 'labeling'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 100,
    difficulty: 'hard',
    requiredSkills: ['chemical safety', 'hazmat protocols', 'storage regulations']
  },
  {
    id: 'ergonomic-safety-assessment',
    name: 'Ergonomic Safety Assessment',
    description: 'Workplace ergonomic safety evaluation and recommendations',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['ergonomics', 'workplace', 'safety', 'assessment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'ergonomic-assessment',
        title: 'Ergonomic Assessment',
        description: 'Workplace ergonomic safety evaluation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'workstation-setup',
            title: 'Assess workstation ergonomics',
            description: 'Evaluate workstation setup for ergonomic safety',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['workstation', 'ergonomics'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 80,
    difficulty: 'medium',
    requiredSkills: ['ergonomic assessment', 'workplace safety', 'health promotion']
  },
  {
    id: 'vehicle-safety-inspection',
    name: 'Vehicle Safety Inspection',
    description: 'Comprehensive vehicle safety inspection and maintenance check',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['vehicle', 'safety', 'inspection', 'maintenance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'vehicle-inspection',
        title: 'Vehicle Safety Inspection',
        description: 'Complete vehicle safety and maintenance check',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'brake-inspection',
            title: 'Inspect braking system',
            description: 'Check brake pads, fluid, and overall braking system safety',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['brakes', 'safety-systems'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['vehicle inspection', 'automotive safety', 'maintenance procedures']
  },
  {
    id: 'chemical-safety-inspection',
    name: 'Chemical Safety Inspection',
    description: 'Chemical storage and handling safety compliance check',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['safety', 'chemical', 'hazmat', 'compliance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'chemical-safety-process',
        title: 'Chemical Safety Process',
        description: 'Chemical handling and storage safety protocols',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'chemical-storage',
            title: 'Inspect chemical storage areas',
            description: 'Verify proper chemical storage, labeling, and containment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['storage', 'labeling'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'hard',
    requiredSkills: ['chemical safety', 'hazmat procedures', 'regulatory compliance']
  },
  {
    id: 'emergency-exit-inspection',
    name: 'Emergency Exit Safety Inspection',
    description: 'Emergency evacuation route and exit safety verification',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['safety', 'emergency', 'evacuation', 'exits'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'exit-safety-process',
        title: 'Exit Safety Process',
        description: 'Emergency exit and evacuation route inspection',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'exit-accessibility',
            title: 'Verify exit accessibility',
            description: 'Ensure all emergency exits are clear, marked, and accessible',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['exits', 'accessibility'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 60,
    difficulty: 'easy',
    requiredSkills: ['emergency planning', 'building codes', 'safety protocols']
  },
  {
    id: 'electrical-safety-inspection',
    name: 'Electrical Safety Inspection',
    description: 'Electrical system safety and compliance verification',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['safety', 'electrical', 'wiring', 'compliance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'electrical-safety-process',
        title: 'Electrical Safety Process',
        description: 'Electrical system safety evaluation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'wiring-inspection',
            title: 'Inspect electrical wiring and panels',
            description: 'Check for damaged wiring, proper grounding, and panel safety',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['wiring', 'panels'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'hard',
    requiredSkills: ['electrical systems', 'safety codes', 'hazard identification']
  },
  {
    id: 'machinery-safety-inspection',
    name: 'Machinery Safety Inspection',
    description: 'Industrial machinery safety and guard inspection',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['safety', 'machinery', 'guards', 'industrial'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'machinery-safety-process',
        title: 'Machinery Safety Process',
        description: 'Industrial machinery safety verification',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'safety-guards',
            title: 'Check safety guards and barriers',
            description: 'Verify all machinery has proper safety guards and barriers',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['guards', 'barriers'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 150,
    difficulty: 'hard',
    requiredSkills: ['machinery safety', 'industrial standards', 'OSHA compliance']
  },
  {
    id: 'fall-protection-inspection',
    name: 'Fall Protection Safety Inspection',
    description: 'Fall protection equipment and system safety check',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['safety', 'fall-protection', 'height', 'harness'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'fall-protection-process',
        title: 'Fall Protection Process',
        description: 'Fall protection equipment and system inspection',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'harness-inspection',
            title: 'Inspect fall protection harnesses',
            description: 'Check harnesses, lanyards, and anchor points for wear and damage',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['harness', 'anchor-points'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'medium',
    requiredSkills: ['fall protection', 'height safety', 'equipment inspection']
  },
  {
    id: 'confined-space-safety-inspection',
    name: 'Confined Space Safety Inspection',
    description: 'Confined space entry safety and atmospheric testing',
    category: {
      id: 'safety-inspection',
      name: 'Safety Inspection',
      description: 'Comprehensive safety and inspection checklists for compliance',
      isActive: true
    },
    version: '1.0.0',
    tags: ['safety', 'confined-space', 'atmospheric', 'entry'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'confined-space-process',
        title: 'Confined Space Process',
        description: 'Confined space entry safety protocols',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'atmospheric-testing',
            title: 'Conduct atmospheric testing',
            description: 'Test air quality and gas levels before entry',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['atmospheric', 'testing'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'hard',
    requiredSkills: ['confined space safety', 'atmospheric monitoring', 'rescue procedures']
  }
];
