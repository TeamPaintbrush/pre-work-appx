import { ChecklistTemplate } from '../../../types';
import { TEMPLATE_CATEGORIES_MAP } from './types';

/**
 * Construction & Building Templates
 * Construction projects, safety protocols, and building procedures (10 templates)
 */
export const CONSTRUCTION_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'site-safety-inspection',
    name: 'Construction Site Safety Inspection',
    description: 'Daily safety check for construction sites',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['safety', 'inspection'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'safety',
        title: 'Safety Inspection',
        description: 'Check site safety measures',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'check-ppe',
            title: 'Verify Personal Protective Equipment',
            description: 'Ensure all workers have proper PPE',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['PPE', 'safety'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-pour',
    name: 'Foundation Pour Checklist',
    description: 'Concrete foundation pouring procedures',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['foundation', 'concrete'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'foundation',
        title: 'Foundation Pour',
        description: 'Pour concrete foundation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'prepare-forms',
            title: 'Prepare Foundation Forms',
            description: 'Set up and check foundation forms',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['forms', 'preparation'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'electrical-rough-in',
    name: 'Electrical Rough-In Inspection',
    description: 'Pre-drywall electrical inspection',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['electrical', 'rough-in'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'electrical',
        title: 'Electrical Rough-In',
        description: 'Inspect electrical rough-in work',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'check-wiring',
            title: 'Check Electrical Wiring',
            description: 'Verify proper wiring installation',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['wiring', 'electrical'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'framing-inspection',
    name: 'Framing Inspection',
    description: 'Structural framing quality check',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['framing', 'structural'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'framing',
        title: 'Framing Check',
        description: 'Inspect structural framing',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'measure-dimensions',
            title: 'Measure Frame Dimensions',
            description: 'Verify framing dimensions and alignment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['dimensions', 'alignment'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'roofing-installation',
    name: 'Roofing Installation',
    description: 'Roof installation and weatherproofing',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['roofing', 'weatherproofing'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'roofing',
        title: 'Roof Installation',
        description: 'Install roofing materials',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'install-underlayment',
            title: 'Install Roof Underlayment',
            description: 'Apply waterproof underlayment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['underlayment', 'waterproofing'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'plumbing-rough-in',
    name: 'Plumbing Rough-In',
    description: 'Pre-wall plumbing installation',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['plumbing', 'rough-in'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'plumbing',
        title: 'Plumbing Rough-In',
        description: 'Install rough plumbing',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'install-pipes',
            title: 'Install Water Supply Pipes',
            description: 'Run water supply lines to fixtures',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['pipes', 'water-supply'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'insulation-installation',
    name: 'Insulation Installation',
    description: 'Thermal insulation installation',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['insulation', 'thermal'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'insulation',
        title: 'Insulation Install',
        description: 'Install thermal insulation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'measure-cavities',
            title: 'Measure Wall Cavities',
            description: 'Measure spaces for proper insulation fit',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: true,
            tags: ['measurement', 'cavities'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'drywall-installation',
    name: 'Drywall Installation',
    description: 'Drywall hanging and finishing',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['drywall', 'finishing'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'drywall',
        title: 'Drywall Install',
        description: 'Hang and finish drywall',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'hang-sheets',
            title: 'Hang Drywall Sheets',
            description: 'Install drywall sheets on framing',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['hanging', 'sheets'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'final-walkthrough',
    name: 'Final Construction Walkthrough',
    description: 'Pre-delivery quality inspection',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['walkthrough', 'quality'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'walkthrough',
        title: 'Final Walkthrough',
        description: 'Complete final inspection',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'check-finishes',
            title: 'Check All Finishes',
            description: 'Inspect paint, flooring, and trim work',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['finishes', 'quality'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'hvac-installation',
    name: 'HVAC System Installation',
    description: 'Heating and cooling system setup',
    category: TEMPLATE_CATEGORIES_MAP.construction,
    version: '1.0',
    tags: ['HVAC', 'mechanical'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'hvac',
        title: 'HVAC Installation',
        description: 'Install HVAC system',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'install-ductwork',
            title: 'Install Ductwork',
            description: 'Run HVAC ductwork throughout building',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['ductwork', 'installation'],
            dependencies: []
          }
        ]
      }
    ]
  }
];

export default CONSTRUCTION_TEMPLATES;
