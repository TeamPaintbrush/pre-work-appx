import { ChecklistTemplate } from '../../../types';
import { TEMPLATE_CATEGORIES_MAP } from './types';

/**
 * Healthcare & Medical Templates
 * Essential medical procedures and healthcare protocols (12 templates)
 */
export const HEALTHCARE_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'patient-room-prep',
    name: 'Patient Room Preparation',
    description: 'Complete patient room setup and sanitization',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['healthcare', 'patient-care'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'prep',
        title: 'Room Preparation',
        description: 'Prepare room for patient',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'check-room',
            title: 'Check Room Assignment',
            description: 'Verify room assignment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['verification'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'surgical-prep',
    name: 'Surgical Preparation',
    description: 'Pre-operative surgical preparation checklist',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['surgery', 'preparation'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'surgical-prep',
        title: 'Surgical Preparation',
        description: 'Prepare for surgery',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'sterilize-instruments',
            title: 'Sterilize Instruments',
            description: 'Sterilize all surgical instruments',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: false,
            tags: ['sterilization'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'medication-administration',
    name: 'Medication Administration',
    description: 'Safe medication administration protocol',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['medication', 'safety'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'med-check',
        title: 'Medication Check',
        description: 'Verify medication details',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'verify-patient',
            title: 'Verify Patient Identity',
            description: 'Confirm patient identity using two identifiers',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: true,
            tags: ['verification', 'safety'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'patient-discharge',
    name: 'Patient Discharge Process',
    description: 'Complete patient discharge checklist',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['discharge', 'patient-care'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'discharge',
        title: 'Discharge Process',
        description: 'Process patient discharge',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'review-instructions',
            title: 'Review Discharge Instructions',
            description: 'Review all discharge instructions with patient',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: true,
            tags: ['instructions', 'education'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response Protocol',
    description: 'Emergency situation response procedures',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['emergency', 'response'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'emergency',
        title: 'Emergency Response',
        description: 'Respond to emergency situation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'assess-situation',
            title: 'Assess Emergency Situation',
            description: 'Quickly assess the emergency situation',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: true,
            tags: ['assessment', 'emergency'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'infection-control',
    name: 'Infection Control Protocol',
    description: 'Standard infection prevention measures',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['infection', 'prevention'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'infection-control',
        title: 'Infection Control',
        description: 'Implement infection control measures',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'hand-hygiene',
            title: 'Perform Hand Hygiene',
            description: 'Proper hand washing or sanitizing procedure',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['hygiene', 'prevention'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'vital-signs-check',
    name: 'Vital Signs Assessment',
    description: 'Complete vital signs monitoring',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['monitoring', 'assessment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'vitals',
        title: 'Vital Signs',
        description: 'Check patient vital signs',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'blood-pressure',
            title: 'Check Blood Pressure',
            description: 'Measure and record blood pressure',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: true,
            tags: ['monitoring'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'patient-admission',
    name: 'Patient Admission Process',
    description: 'Complete patient admission checklist',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['admission', 'intake'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'admission',
        title: 'Admission Process',
        description: 'Process patient admission',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'collect-insurance',
            title: 'Collect Insurance Information',
            description: 'Gather and verify insurance details',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: false,
            tags: ['documentation'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'wound-care',
    name: 'Wound Care Protocol',
    description: 'Standard wound assessment and care',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['wound-care', 'treatment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'wound-care',
        title: 'Wound Care',
        description: 'Assess and treat wound',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'assess-wound',
            title: 'Assess Wound Condition',
            description: 'Examine wound for signs of healing or infection',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: true,
            requiresNotes: true,
            tags: ['assessment'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'lab-specimen-collection',
    name: 'Laboratory Specimen Collection',
    description: 'Proper specimen collection procedures',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['laboratory', 'specimens'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'specimen',
        title: 'Specimen Collection',
        description: 'Collect laboratory specimen',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'label-specimen',
            title: 'Label Specimen Container',
            description: 'Properly label specimen with patient information',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['labeling', 'safety'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'patient-transport',
    name: 'Patient Transport Protocol',
    description: 'Safe patient transport procedures',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['transport', 'safety'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'transport',
        title: 'Patient Transport',
        description: 'Transport patient safely',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'check-equipment',
            title: 'Check Transport Equipment',
            description: 'Verify all transport equipment is functional',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['equipment', 'safety'],
            dependencies: []
          }
        ]
      }
    ]
  },
  {
    id: 'nutrition-assessment',
    name: 'Nutritional Assessment',
    description: 'Patient nutritional evaluation',
    category: TEMPLATE_CATEGORIES_MAP.healthcare,
    version: '1.0',
    tags: ['nutrition', 'assessment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-01'),
    sections: [
      {
        id: 'nutrition',
        title: 'Nutritional Assessment',
        description: 'Assess patient nutritional needs',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'dietary-restrictions',
            title: 'Review Dietary Restrictions',
            description: 'Check for allergies and dietary requirements',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: true,
            tags: ['dietary', 'allergies'],
            dependencies: []
          }
        ]
      }
    ]
  }
];

export default HEALTHCARE_TEMPLATES;
