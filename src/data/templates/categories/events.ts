import { ChecklistTemplate } from '../../../types';

export const EVENT_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'conference-setup',
    name: 'Conference Setup & Management',
    description: 'Complete conference planning, setup, and execution',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['conference', 'business-event', 'setup', 'coordination'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'conference-setup-process',
        title: 'Conference Setup Process',
        description: 'Professional conference planning and execution',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'venue-preparation',
            title: 'Prepare conference venue',
            description: 'Set up seating, AV equipment, and registration areas',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['venue', 'setup'],
            dependencies: []
          },
          {
            id: 'av-equipment-setup',
            title: 'Configure AV equipment',
            description: 'Test and configure all audio-visual equipment',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['av-equipment', 'technology'],
            dependencies: ['venue-preparation']
          }
        ]
      }
    ],
    estimatedDuration: 480,
    difficulty: 'hard',
    requiredSkills: ['event planning', 'venue management', 'AV technology']
  },
  {
    id: 'wedding-setup',
    name: 'Wedding Ceremony & Reception Setup',
    description: 'Complete wedding event planning and setup coordination',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['wedding', 'ceremony', 'reception', 'celebration'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'wedding-setup-process',
        title: 'Wedding Setup Process',
        description: 'Wedding ceremony and reception coordination',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'ceremony-setup',
            title: 'Set up ceremony space',
            description: 'Arrange seating, altar, and decorations for ceremony',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['ceremony', 'decorations'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 600,
    difficulty: 'hard',
    requiredSkills: ['wedding coordination', 'decoration setup', 'timeline management']
  },
  {
    id: 'trade-show-setup',
    name: 'Trade Show Booth Setup',
    description: 'Trade show booth design, setup, and breakdown',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['trade-show', 'booth', 'exhibition', 'marketing'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'booth-setup-process',
        title: 'Booth Setup Process',
        description: 'Trade show booth construction and display',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'booth-construction',
            title: 'Construct booth display',
            description: 'Assemble booth structure and promotional displays',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['construction', 'displays'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 360,
    difficulty: 'medium',
    requiredSkills: ['booth construction', 'marketing displays', 'logistics coordination']
  },
  {
    id: 'concert-setup',
    name: 'Concert & Music Event Setup',
    description: 'Live music event planning, setup, and production',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['concert', 'music', 'live-event', 'production'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'concert-setup-process',
        title: 'Concert Setup Process',
        description: 'Live music event production and setup',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'stage-setup',
            title: 'Set up performance stage',
            description: 'Configure stage, lighting, and sound systems',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['stage', 'lighting', 'sound'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 720,
    difficulty: 'hard',
    requiredSkills: ['event production', 'sound engineering', 'stage management']
  },
  {
    id: 'corporate-retreat-setup',
    name: 'Corporate Retreat Planning',
    description: 'Corporate retreat and team building event coordination',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['corporate', 'retreat', 'team-building', 'business'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'retreat-setup-process',
        title: 'Retreat Setup Process',
        description: 'Corporate retreat planning and coordination',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'activity-setup',
            title: 'Organize team activities',
            description: 'Plan and set up team building activities and workshops',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['team-building', 'activities'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 480,
    difficulty: 'medium',
    requiredSkills: ['corporate planning', 'team facilitation', 'retreat coordination']
  },
  {
    id: 'festival-setup',
    name: 'Festival Event Coordination',
    description: 'Large-scale festival planning, setup, and management',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['festival', 'large-scale', 'outdoor', 'community'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'festival-setup-process',
        title: 'Festival Setup Process',
        description: 'Large-scale festival coordination and setup',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'vendor-coordination',
            title: 'Coordinate vendor setup',
            description: 'Manage vendor booth placement and utility connections',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['vendors', 'coordination'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 960,
    difficulty: 'hard',
    requiredSkills: ['large event management', 'vendor coordination', 'logistics planning']
  },
  {
    id: 'charity-gala-setup',
    name: 'Charity Gala Event Setup',
    description: 'Formal charity gala planning and execution',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['charity', 'gala', 'formal', 'fundraising'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'gala-setup-process',
        title: 'Gala Setup Process',
        description: 'Formal charity gala coordination',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'formal-setup',
            title: 'Set up formal dining area',
            description: 'Arrange formal table settings and decorations',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['formal-dining', 'decorations'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 540,
    difficulty: 'hard',
    requiredSkills: ['formal event planning', 'fundraising coordination', 'catering management']
  },
  {
    id: 'sports-event-setup',
    name: 'Sports Event Coordination',
    description: 'Sports tournament and competition event management',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['sports', 'tournament', 'competition', 'athletics'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'sports-setup-process',
        title: 'Sports Event Setup Process',
        description: 'Sports competition coordination and setup',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'field-preparation',
            title: 'Prepare playing field',
            description: 'Set up playing field, equipment, and safety barriers',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['field-setup', 'equipment'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 420,
    difficulty: 'medium',
    requiredSkills: ['sports event management', 'field setup', 'safety coordination']
  },
  {
    id: 'wedding-ceremony-setup',
    name: 'Wedding Ceremony Setup',
    description: 'Complete wedding ceremony venue setup and coordination',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'wedding', 'ceremony', 'setup'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'ceremony-setup-process',
        title: 'Ceremony Setup Process',
        description: 'Wedding ceremony venue preparation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'altar-setup',
            title: 'Set up altar and decorations',
            description: 'Arrange ceremony altar, arch, and floral decorations',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['altar', 'decorations'],
            dependencies: []
          },
          {
            id: 'seating-arrangement',
            title: 'Arrange ceremony seating',
            description: 'Set up chairs and aisle for wedding ceremony',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['seating', 'aisle'],
            dependencies: ['altar-setup']
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['event planning', 'decoration setup', 'coordination']
  },
  {
    id: 'trade-show-booth-setup',
    name: 'Trade Show Booth Setup',
    description: 'Professional trade show booth setup and display',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'trade-show', 'booth', 'display'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'booth-setup-process',
        title: 'Booth Setup Process',
        description: 'Trade show booth preparation and display',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'display-assembly',
            title: 'Assemble booth display',
            description: 'Set up booth structure, banners, and product displays',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['display', 'assembly'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 200,
    difficulty: 'medium',
    requiredSkills: ['trade show setup', 'display assembly', 'marketing presentation']
  },
  {
    id: 'outdoor-festival-setup',
    name: 'Outdoor Festival Setup',
    description: 'Large outdoor festival and event coordination',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'festival', 'outdoor', 'large-scale'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'festival-setup-process',
        title: 'Festival Setup Process',
        description: 'Outdoor festival venue preparation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'stage-setup',
            title: 'Set up main stage and sound',
            description: 'Assemble stage, sound system, and lighting equipment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['stage', 'sound-system'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 480,
    difficulty: 'hard',
    requiredSkills: ['large event coordination', 'stage setup', 'outdoor logistics']
  },
  {
    id: 'charity-gala-setup',
    name: 'Charity Gala Setup',
    description: 'Formal charity gala and fundraising event setup',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'gala', 'charity', 'formal'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'gala-setup-process',
        title: 'Gala Setup Process',
        description: 'Formal gala venue preparation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'table-settings',
            title: 'Set up formal table settings',
            description: 'Arrange tables with linens, centerpieces, and place settings',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['table-settings', 'formal'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 300,
    difficulty: 'medium',
    requiredSkills: ['formal event planning', 'table setup', 'gala coordination']
  },
  {
    id: 'graduation-ceremony-setup',
    name: 'Graduation Ceremony Setup',
    description: 'Academic graduation ceremony venue and protocol setup',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'graduation', 'ceremony', 'academic'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'graduation-setup-process',
        title: 'Graduation Setup Process',
        description: 'Graduation ceremony venue preparation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'processional-setup',
            title: 'Set up processional route',
            description: 'Arrange seating and processional path for graduates',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['processional', 'seating'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['ceremony coordination', 'academic protocol', 'large group management']
  },
  {
    id: 'product-launch-event',
    name: 'Product Launch Event Setup',
    description: 'Corporate product launch and media event coordination',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'product-launch', 'corporate', 'media'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'launch-setup-process',
        title: 'Launch Event Setup Process',
        description: 'Product launch event preparation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'product-display',
            title: 'Set up product displays',
            description: 'Arrange product showcases and demonstration areas',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['product-display', 'demonstration'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['product presentation', 'media coordination', 'corporate events']
  },
  {
    id: 'music-concert-setup',
    name: 'Music Concert Setup',
    description: 'Live music venue and concert production setup',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'concert', 'music', 'live-entertainment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'concert-setup-process',
        title: 'Concert Setup Process',
        description: 'Music venue and production setup',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'sound-system-setup',
            title: 'Set up sound system and stage',
            description: 'Install and test sound equipment, lighting, and stage setup',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['sound-system', 'stage', 'lighting'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 360,
    difficulty: 'hard',
    requiredSkills: ['concert production', 'sound engineering', 'stage management']
  },
  {
    id: 'art-exhibition-setup',
    name: 'Art Exhibition Setup',
    description: 'Gallery and museum exhibition installation and setup',
    category: {
      id: 'event-preparation',
      name: 'Event Preparation',
      description: 'Event setup, coordination, and breakdown templates',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event', 'art', 'exhibition', 'gallery'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'exhibition-setup-process',
        title: 'Exhibition Setup Process',
        description: 'Art exhibition installation and preparation',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'artwork-installation',
            title: 'Install artwork and displays',
            description: 'Carefully hang and position artwork with proper lighting',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['artwork', 'installation', 'lighting'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['art handling', 'exhibition design', 'lighting coordination']
  }
];
