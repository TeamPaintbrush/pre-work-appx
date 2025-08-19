import { ChecklistTemplate } from '../../../types';

export const EVENT_SETUP_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'stage-lighting-setup',
    name: 'Stage Lighting Setup',
    description: 'Professional stage lighting design and installation',
    category: {
      id: 'event-setup',
      name: 'Event Setup',
      description: 'Technical event setup and equipment installation',
      isActive: true
    },
    version: '1.0.0',
    tags: ['stage', 'lighting', 'technical', 'equipment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'lighting-setup-process',
        title: 'Lighting Setup Process',
        description: 'Professional stage lighting installation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'lighting-rig-assembly',
            title: 'Assemble lighting rig',
            description: 'Install and position lighting fixtures and trusses',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['lighting-rig', 'fixtures'],
            dependencies: []
          },
          {
            id: 'lighting-programming',
            title: 'Program lighting console',
            description: 'Set up lighting cues and control sequences',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['programming', 'control'],
            dependencies: ['lighting-rig-assembly']
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'hard',
    requiredSkills: ['lighting design', 'electrical systems', 'stage technology']
  },
  {
    id: 'sound-system-installation',
    name: 'Sound System Installation',
    description: 'Professional audio system setup and testing',
    category: {
      id: 'event-setup',
      name: 'Event Setup',
      description: 'Technical event setup and equipment installation',
      isActive: true
    },
    version: '1.0.0',
    tags: ['sound', 'audio', 'speakers', 'mixing'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'sound-setup-process',
        title: 'Sound Setup Process',
        description: 'Professional audio system installation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'speaker-positioning',
            title: 'Position speakers and equipment',
            description: 'Install and position speakers, mixers, and audio equipment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['speakers', 'positioning'],
            dependencies: []
          },
          {
            id: 'sound-testing',
            title: 'Test and calibrate sound system',
            description: 'Perform sound checks and adjust levels',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['testing', 'calibration'],
            dependencies: ['speaker-positioning']
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'hard',
    requiredSkills: ['audio engineering', 'sound mixing', 'equipment setup']
  },
  {
    id: 'video-projection-setup',
    name: 'Video Projection Setup',
    description: 'Large screen projection and video display installation',
    category: {
      id: 'event-setup',
      name: 'Event Setup',
      description: 'Technical event setup and equipment installation',
      isActive: true
    },
    version: '1.0.0',
    tags: ['video', 'projection', 'screens', 'display'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'projection-setup-process',
        title: 'Projection Setup Process',
        description: 'Video projection system installation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'screen-installation',
            title: 'Install projection screens',
            description: 'Set up and position projection screens and surfaces',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['screens', 'installation'],
            dependencies: []
          },
          {
            id: 'projector-calibration',
            title: 'Calibrate projectors',
            description: 'Adjust projector settings and image quality',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['calibration', 'image-quality'],
            dependencies: ['screen-installation']
          }
        ]
      }
    ],
    estimatedDuration: 150,
    difficulty: 'medium',
    requiredSkills: ['video technology', 'projection systems', 'display calibration']
  },
  {
    id: 'tent-structure-assembly',
    name: 'Event Tent Structure Assembly',
    description: 'Large tent and temporary structure installation',
    category: {
      id: 'event-setup',
      name: 'Event Setup',
      description: 'Technical event setup and equipment installation',
      isActive: true
    },
    version: '1.0.0',
    tags: ['tent', 'structure', 'outdoor', 'assembly'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'tent-assembly-process',
        title: 'Tent Assembly Process',
        description: 'Event tent structure installation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'foundation-preparation',
            title: 'Prepare foundation and anchoring',
            description: 'Level ground and install tent anchoring systems',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['foundation', 'anchoring'],
            dependencies: []
          },
          {
            id: 'tent-erection',
            title: 'Erect tent structure',
            description: 'Assemble and raise tent frame and covering',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['erection', 'assembly'],
            dependencies: ['foundation-preparation']
          }
        ]
      }
    ],
    estimatedDuration: 300,
    difficulty: 'hard',
    requiredSkills: ['structural assembly', 'outdoor setup', 'safety protocols']
  },
  {
    id: 'power-distribution-setup',
    name: 'Event Power Distribution',
    description: 'Electrical power distribution and safety for events',
    category: {
      id: 'event-setup',
      name: 'Event Setup',
      description: 'Technical event setup and equipment installation',
      isActive: true
    },
    version: '1.0.0',
    tags: ['power', 'electrical', 'distribution', 'safety'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'power-setup-process',
        title: 'Power Setup Process',
        description: 'Event electrical distribution installation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'main-power-connection',
            title: 'Establish main power connection',
            description: 'Connect to main power source and install distribution panels',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['main-power', 'distribution'],
            dependencies: []
          },
          {
            id: 'circuit-testing',
            title: 'Test all electrical circuits',
            description: 'Verify power distribution and safety systems',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['testing', 'safety'],
            dependencies: ['main-power-connection']
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'hard',
    requiredSkills: ['electrical work', 'power systems', 'safety protocols']
  },
  {
    id: 'staging-platform-construction',
    name: 'Staging Platform Construction',
    description: 'Stage platform and riser assembly for events',
    category: {
      id: 'event-setup',
      name: 'Event Setup',
      description: 'Technical event setup and equipment installation',
      isActive: true
    },
    version: '1.0.0',
    tags: ['stage', 'platform', 'construction', 'risers'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'staging-construction-process',
        title: 'Staging Construction Process',
        description: 'Stage platform assembly and setup',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'platform-assembly',
            title: 'Assemble stage platforms',
            description: 'Connect modular stage pieces and secure framework',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['platform', 'assembly'],
            dependencies: []
          },
          {
            id: 'safety-inspection',
            title: 'Conduct safety inspection',
            description: 'Verify stage stability and safety compliance',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['safety', 'inspection'],
            dependencies: ['platform-assembly']
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['stage construction', 'structural assembly', 'safety inspection']
  },
  {
    id: 'catering-kitchen-setup',
    name: 'Temporary Catering Kitchen Setup',
    description: 'Mobile kitchen and food service equipment installation',
    category: {
      id: 'event-setup',
      name: 'Event Setup',
      description: 'Technical event setup and equipment installation',
      isActive: true
    },
    version: '1.0.0',
    tags: ['catering', 'kitchen', 'food-service', 'mobile'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'kitchen-setup-process',
        title: 'Kitchen Setup Process',
        description: 'Temporary catering kitchen installation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'equipment-installation',
            title: 'Install kitchen equipment',
            description: 'Set up cooking equipment, refrigeration, and prep areas',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['equipment', 'installation'],
            dependencies: []
          },
          {
            id: 'sanitation-setup',
            title: 'Establish sanitation systems',
            description: 'Install handwashing, waste management, and cleaning stations',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['sanitation', 'hygiene'],
            dependencies: ['equipment-installation']
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['food service setup', 'equipment installation', 'health compliance']
  }
];
