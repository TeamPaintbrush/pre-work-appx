import { ChecklistTemplate } from '../../../types';

export const HOSPITALITY_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'hotel-guest-checkin',
    name: 'Hotel Guest Check-In Process',
    description: 'Comprehensive guest check-in and welcome service',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['hotel', 'check-in', 'guest-service', 'hospitality'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'checkin-process',
        title: 'Guest Check-In Process',
        description: 'Professional guest check-in procedures',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'verify-reservation',
            title: 'Verify guest reservation',
            description: 'Confirm reservation details and guest identification',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['reservation', 'verification'],
            dependencies: []
          },
          {
            id: 'room-assignment',
            title: 'Assign room and provide keys',
            description: 'Assign appropriate room and provide access keys/cards',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['room-assignment', 'keys'],
            dependencies: ['verify-reservation']
          }
        ]
      }
    ],
    estimatedDuration: 30,
    difficulty: 'easy',
    requiredSkills: ['customer service', 'hotel systems', 'communication']
  },
  {
    id: 'restaurant-table-service',
    name: 'Restaurant Table Service',
    description: 'Professional dining table service and customer care',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['restaurant', 'table-service', 'dining', 'waitstaff'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'table-service-process',
        title: 'Table Service Process',
        description: 'Professional restaurant table service',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'greet-guests',
            title: 'Greet and seat guests',
            description: 'Welcome guests and escort to assigned table',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['greeting', 'seating'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 60,
    difficulty: 'medium',
    requiredSkills: ['food service', 'customer relations', 'multitasking']
  },
  {
    id: 'concierge-service',
    name: 'Hotel Concierge Service',
    description: 'Premium concierge service and guest assistance',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['concierge', 'guest-assistance', 'luxury-service', 'recommendations'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'concierge-service-process',
        title: 'Concierge Service Process',
        description: 'Premium guest assistance and recommendations',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'guest-requests',
            title: 'Handle guest requests',
            description: 'Process and fulfill guest requests and recommendations',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['requests', 'recommendations'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 45,
    difficulty: 'hard',
    requiredSkills: ['local knowledge', 'networking', 'problem-solving']
  },
  {
    id: 'housekeeping-service',
    name: 'Hotel Housekeeping Service',
    description: 'Professional hotel room cleaning and maintenance',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['housekeeping', 'room-cleaning', 'hotel-maintenance', 'cleanliness'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'housekeeping-process',
        title: 'Housekeeping Process',
        description: 'Professional hotel room cleaning',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'room-cleaning',
            title: 'Clean guest room thoroughly',
            description: 'Complete room cleaning including bathroom and linens',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['room-cleaning', 'sanitization'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'medium',
    requiredSkills: ['hotel housekeeping', 'attention to detail', 'time efficiency']
  },
  {
    id: 'banquet-service',
    name: 'Banquet Event Service',
    description: 'Professional banquet and catering service coordination',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['banquet', 'catering', 'event-service', 'food-service'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'banquet-service-process',
        title: 'Banquet Service Process',
        description: 'Professional banquet event coordination',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'setup-banquet',
            title: 'Set up banquet facility',
            description: 'Arrange tables, linens, and serving stations',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['setup', 'facility-preparation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'hard',
    requiredSkills: ['banquet coordination', 'team management', 'event timing']
  },
  {
    id: 'spa-wellness-service',
    name: 'Spa & Wellness Service',
    description: 'Spa treatment and wellness service delivery',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['spa', 'wellness', 'relaxation', 'therapy'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'spa-service-process',
        title: 'Spa Service Process',
        description: 'Professional spa and wellness treatments',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'treatment-preparation',
            title: 'Prepare treatment room',
            description: 'Set up treatment room with proper ambiance and supplies',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['treatment-room', 'ambiance'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['spa treatments', 'wellness knowledge', 'client care']
  },
  {
    id: 'valet-parking-service',
    name: 'Valet Parking Service',
    description: 'Professional valet parking and vehicle handling',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['valet', 'parking', 'vehicle-handling', 'customer-service'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'valet-service-process',
        title: 'Valet Service Process',
        description: 'Professional valet parking operations',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'vehicle-reception',
            title: 'Receive guest vehicle',
            description: 'Greet guest and safely receive vehicle for parking',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['vehicle-reception', 'customer-greeting'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 15,
    difficulty: 'medium',
    requiredSkills: ['driving skills', 'customer service', 'vehicle handling']
  },
  {
    id: 'room-service-delivery',
    name: 'Hotel Room Service',
    description: 'In-room dining service and delivery',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['room-service', 'dining', 'delivery', 'in-room'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'room-service-process',
        title: 'Room Service Process',
        description: 'Professional in-room dining service',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'order-preparation',
            title: 'Prepare room service order',
            description: 'Coordinate with kitchen and prepare order for delivery',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['order-preparation', 'kitchen-coordination'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 45,
    difficulty: 'medium',
    requiredSkills: ['food service', 'time management', 'presentation']
  },
  {
    id: 'guest-checkout-service',
    name: 'Hotel Guest Check-Out',
    description: 'Professional guest check-out and departure service',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['check-out', 'departure', 'billing', 'guest-service'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'checkout-process',
        title: 'Guest Check-Out Process',
        description: 'Professional guest departure procedures',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'finalize-billing',
            title: 'Process final billing',
            description: 'Review charges and process payment for guest stay',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['billing', 'payment'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 20,
    difficulty: 'easy',
    requiredSkills: ['billing systems', 'customer service', 'payment processing']
  },
  {
    id: 'event-catering-service',
    name: 'Event Catering Service',
    description: 'Professional catering service for special events',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['catering', 'event-service', 'food-service', 'special-events'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'catering-service-process',
        title: 'Catering Service Process',
        description: 'Professional event catering coordination',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'menu-execution',
            title: 'Execute catering menu',
            description: 'Prepare and serve planned menu items for event',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['menu-execution', 'food-preparation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 360,
    difficulty: 'hard',
    requiredSkills: ['catering operations', 'food safety', 'event coordination']
  },
  {
    id: 'guest-relations-service',
    name: 'Guest Relations Management',
    description: 'Guest satisfaction and relationship management service',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['guest-relations', 'satisfaction', 'customer-care', 'feedback'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'guest-relations-process',
        title: 'Guest Relations Process',
        description: 'Guest satisfaction and feedback management',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'feedback-collection',
            title: 'Collect guest feedback',
            description: 'Gather and document guest feedback and suggestions',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['feedback', 'documentation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 30,
    difficulty: 'medium',
    requiredSkills: ['relationship management', 'communication', 'problem resolution']
  },
  {
    id: 'retail-customer-service',
    name: 'Retail Customer Service',
    description: 'Professional retail customer assistance and sales support',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['retail', 'customer-service', 'sales', 'assistance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'retail-service-process',
        title: 'Retail Service Process',
        description: 'Professional retail customer assistance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'customer-greeting',
            title: 'Greet and assist customers',
            description: 'Welcome customers and provide product assistance',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['greeting', 'assistance'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 20,
    difficulty: 'easy',
    requiredSkills: ['customer service', 'product knowledge', 'sales techniques']
  },
  {
    id: 'call-center-service',
    name: 'Call Center Customer Support',
    description: 'Professional telephone customer support and service',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['call-center', 'telephone', 'customer-support', 'helpdesk'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'call-center-process',
        title: 'Call Center Process',
        description: 'Professional telephone customer support',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'call-handling',
            title: 'Handle customer calls',
            description: 'Answer calls professionally and resolve customer issues',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['call-handling', 'issue-resolution'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 15,
    difficulty: 'medium',
    requiredSkills: ['telephone etiquette', 'problem-solving', 'system navigation']
  },
  {
    id: 'personal-shopping-service',
    name: 'Personal Shopping Service',
    description: 'Personalized shopping assistance and styling service',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['personal-shopping', 'styling', 'consultation', 'retail'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'personal-shopping-process',
        title: 'Personal Shopping Process',
        description: 'Personalized shopping and styling assistance',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'style-consultation',
            title: 'Conduct style consultation',
            description: 'Assess client needs and preferences for personalized service',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['consultation', 'styling'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['fashion knowledge', 'client consultation', 'personal styling']
  },
  {
    id: 'customer-complaint-resolution',
    name: 'Customer Complaint Resolution',
    description: 'Professional customer complaint handling and resolution',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['complaints', 'resolution', 'customer-service', 'problem-solving'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'complaint-resolution-process',
        title: 'Complaint Resolution Process',
        description: 'Professional complaint handling and resolution',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'listen-document',
            title: 'Listen and document complaint',
            description: 'Actively listen to customer concerns and document details',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['listening', 'documentation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 30,
    difficulty: 'hard',
    requiredSkills: ['conflict resolution', 'active listening', 'problem-solving']
  },
  {
    id: 'loyalty-program-management',
    name: 'Customer Loyalty Program',
    description: 'Customer loyalty program enrollment and management',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['loyalty-program', 'customer-retention', 'rewards', 'enrollment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'loyalty-program-process',
        title: 'Loyalty Program Process',
        description: 'Customer loyalty program management',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'program-enrollment',
            title: 'Enroll customers in program',
            description: 'Sign up customers for loyalty rewards program',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['enrollment', 'rewards'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 10,
    difficulty: 'easy',
    requiredSkills: ['program knowledge', 'customer education', 'system operation']
  },
  {
    id: 'product-demonstration',
    name: 'Product Demonstration Service',
    description: 'Interactive product demonstration and customer education',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['demonstration', 'product-education', 'sales-support', 'training'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'demonstration-process',
        title: 'Product Demonstration Process',
        description: 'Interactive product demonstration and education',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'product-setup',
            title: 'Set up product demonstration',
            description: 'Prepare product and demonstration area for customer education',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['setup', 'preparation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 45,
    difficulty: 'medium',
    requiredSkills: ['product expertise', 'presentation skills', 'customer education']
  },
  {
    id: 'special-event-hosting',
    name: 'Special Event Hosting',
    description: 'Professional hosting for special events and occasions',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['event-hosting', 'special-occasions', 'customer-experience', 'hospitality'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'event-hosting-process',
        title: 'Event Hosting Process',
        description: 'Professional special event hosting',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'event-coordination',
            title: 'Coordinate event activities',
            description: 'Manage event flow and coordinate activities for guests',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['coordination', 'activities'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'hard',
    requiredSkills: ['event management', 'hosting skills', 'customer engagement']
  },
  {
    id: 'delivery-service-management',
    name: 'Delivery Service Management',
    description: 'Professional delivery service coordination and customer communication',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['delivery', 'logistics', 'customer-communication', 'service'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'delivery-process',
        title: 'Delivery Service Process',
        description: 'Professional delivery coordination and communication',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'delivery-coordination',
            title: 'Coordinate delivery schedule',
            description: 'Schedule and coordinate delivery with customer',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['scheduling', 'coordination'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 25,
    difficulty: 'medium',
    requiredSkills: ['logistics coordination', 'customer communication', 'time management']
  },
  {
    id: 'membership-services',
    name: 'Membership Services Management',
    description: 'Club and membership services coordination and support',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['membership', 'club-services', 'member-support', 'benefits'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'membership-process',
        title: 'Membership Services Process',
        description: 'Club and membership support services',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'member-benefits',
            title: 'Explain member benefits',
            description: 'Educate members about available benefits and services',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['benefits', 'education'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 20,
    difficulty: 'easy',
    requiredSkills: ['membership knowledge', 'customer education', 'service coordination']
  },
  {
    id: 'virtual-customer-service',
    name: 'Virtual Customer Service',
    description: 'Online and virtual customer service support',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['virtual', 'online-service', 'digital-support', 'remote'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'virtual-service-process',
        title: 'Virtual Service Process',
        description: 'Online and virtual customer support',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'online-assistance',
            title: 'Provide online assistance',
            description: 'Deliver customer support through digital channels',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['online-support', 'digital-channels'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 20,
    difficulty: 'medium',
    requiredSkills: ['digital communication', 'virtual tools', 'online customer service']
  },
  {
    id: 'quality-assurance-service',
    name: 'Service Quality Assurance',
    description: 'Service quality monitoring and improvement processes',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Templates for hospitality, customer service, and retail',
      isActive: true
    },
    version: '1.0.0',
    tags: ['quality-assurance', 'service-monitoring', 'improvement', 'standards'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'quality-assurance-process',
        title: 'Quality Assurance Process',
        description: 'Service quality monitoring and improvement',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'service-evaluation',
            title: 'Evaluate service quality',
            description: 'Monitor and assess service delivery standards',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['evaluation', 'monitoring'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 60,
    difficulty: 'medium',
    requiredSkills: ['quality assessment', 'service standards', 'evaluation techniques']
  },
  {
    id: 'vip-guest-service',
    name: 'VIP Guest Service Protocol',
    description: 'Premium service standards for VIP and high-profile guests',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['vip', 'premium-service', 'luxury', 'special-guests'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'vip-service-process',
        title: 'VIP Service Process',
        description: 'Exceptional service standards for VIP guests',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pre-arrival-preparation',
            title: 'Prepare for VIP arrival',
            description: 'Review guest preferences and arrange special amenities',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pre-arrival', 'preferences'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 90,
    difficulty: 'hard',
    requiredSkills: ['luxury service', 'personalization', 'attention to detail']
  },
  {
    id: 'spa-treatment-service',
    name: 'Spa Treatment Service Standards',
    description: 'Professional spa and wellness service delivery',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['spa', 'wellness', 'treatment', 'relaxation'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'spa-service-process',
        title: 'Spa Service Process',
        description: 'Professional spa treatment delivery',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'consultation-assessment',
            title: 'Conduct client consultation',
            description: 'Assess client needs and customize treatment plan',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['consultation', 'assessment'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'medium',
    requiredSkills: ['spa therapy', 'client consultation', 'wellness protocols']
  },
  {
    id: 'catering-event-service',
    name: 'Catering Event Service',
    description: 'Professional catering service for events and functions',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['catering', 'events', 'food-service', 'banquet'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'catering-service-process',
        title: 'Catering Service Process',
        description: 'Event catering service standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'menu-setup',
            title: 'Set up buffet and serving stations',
            description: 'Arrange food displays and serving equipment',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['buffet', 'food-display'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['food service', 'event catering', 'presentation skills']
  },
  {
    id: 'cruise-guest-services',
    name: 'Cruise Ship Guest Services',
    description: 'Comprehensive cruise ship hospitality and entertainment',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['cruise', 'maritime', 'entertainment', 'guest-relations'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'cruise-service-process',
        title: 'Cruise Service Process',
        description: 'Maritime hospitality service standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'embarkation-welcome',
            title: 'Welcome guests at embarkation',
            description: 'Provide warm welcome and ship orientation',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['embarkation', 'welcome'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 45,
    difficulty: 'medium',
    requiredSkills: ['maritime hospitality', 'crowd management', 'entertainment coordination']
  },
  {
    id: 'airline-cabin-service',
    name: 'Airline Cabin Service Standards',
    description: 'Professional flight attendant service and safety protocols',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['airline', 'cabin-crew', 'flight-service', 'aviation'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'cabin-service-process',
        title: 'Cabin Service Process',
        description: 'Professional airline cabin service',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'pre-flight-preparation',
            title: 'Complete pre-flight cabin preparation',
            description: 'Check cabin equipment and prepare for passenger boarding',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['pre-flight', 'cabin-prep'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 30,
    difficulty: 'hard',
    requiredSkills: ['aviation service', 'safety protocols', 'emergency procedures']
  },
  {
    id: 'luxury-resort-butler',
    name: 'Luxury Resort Butler Service',
    description: 'Personal butler service for luxury resort guests',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['butler', 'luxury', 'resort', 'personal-service'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'butler-service-process',
        title: 'Butler Service Process',
        description: 'Personalized luxury resort butler service',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'guest-preference-assessment',
            title: 'Assess guest preferences and needs',
            description: 'Conduct detailed assessment of guest preferences and requirements',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preferences', 'personalization'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 60,
    difficulty: 'hard',
    requiredSkills: ['personal service', 'luxury hospitality', 'discretion and etiquette']
  },
  {
    id: 'casino-guest-relations',
    name: 'Casino Guest Relations Service',
    description: 'Casino floor guest services and player relations',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['casino', 'gaming', 'guest-relations', 'entertainment'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'casino-service-process',
        title: 'Casino Service Process',
        description: 'Gaming floor hospitality standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'player-welcome',
            title: 'Welcome and assist players',
            description: 'Provide friendly welcome and gaming assistance',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['player-relations', 'gaming-assistance'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 45,
    difficulty: 'medium',
    requiredSkills: ['gaming knowledge', 'customer relations', 'entertainment hospitality']
  },
  {
    id: 'wedding-venue-coordination',
    name: 'Wedding Venue Coordination',
    description: 'Wedding venue hospitality and event coordination',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['wedding', 'venue', 'coordination', 'special-events'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'wedding-coordination-process',
        title: 'Wedding Coordination Process',
        description: 'Wedding venue service and coordination',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'bridal-party-coordination',
            title: 'Coordinate with bridal party',
            description: 'Assist bridal party with timeline and venue logistics',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['bridal-party', 'coordination'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 480,
    difficulty: 'hard',
    requiredSkills: ['event coordination', 'wedding planning', 'stress management']
  },
  {
    id: 'golf-clubhouse-service',
    name: 'Golf Clubhouse Service',
    description: 'Golf club hospitality and member services',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['golf', 'clubhouse', 'member-services', 'sports-hospitality'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'clubhouse-service-process',
        title: 'Clubhouse Service Process',
        description: 'Golf club member service standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'member-check-in',
            title: 'Check in members and guests',
            description: 'Verify membership and assist with tee time arrangements',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['member-services', 'tee-times'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 30,
    difficulty: 'medium',
    requiredSkills: ['golf knowledge', 'member relations', 'sports hospitality']
  },
  {
    id: 'theme-park-guest-services',
    name: 'Theme Park Guest Services',
    description: 'Theme park visitor assistance and experience enhancement',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['theme-park', 'entertainment', 'family-services', 'attraction'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'theme-park-service-process',
        title: 'Theme Park Service Process',
        description: 'Theme park guest assistance standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'park-orientation',
            title: 'Provide park orientation and maps',
            description: 'Help guests navigate park and plan their visit',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['orientation', 'navigation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 15,
    difficulty: 'easy',
    requiredSkills: ['park knowledge', 'family assistance', 'crowd management']
  },
  {
    id: 'luxury-car-service',
    name: 'Luxury Transportation Service',
    description: 'Premium chauffeur and luxury vehicle service',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['transportation', 'luxury', 'chauffeur', 'premium-service'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'luxury-transport-process',
        title: 'Luxury Transport Process',
        description: 'Premium transportation service standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'vehicle-preparation',
            title: 'Prepare luxury vehicle',
            description: 'Ensure vehicle cleanliness and premium amenities',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['vehicle-prep', 'luxury-amenities'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 20,
    difficulty: 'medium',
    requiredSkills: ['professional driving', 'luxury service', 'discretion']
  },
  {
    id: 'private-yacht-service',
    name: 'Private Yacht Charter Service',
    description: 'Luxury yacht hospitality and marine service',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['yacht', 'marine', 'luxury', 'charter'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'yacht-service-process',
        title: 'Yacht Service Process',
        description: 'Luxury yacht charter service standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'yacht-preparation',
            title: 'Prepare yacht for charter',
            description: 'Complete yacht inspection and guest preparation',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['yacht-prep', 'charter-ready'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'hard',
    requiredSkills: ['marine hospitality', 'yacht operations', 'luxury service']
  },
  {
    id: 'ski-resort-guest-services',
    name: 'Ski Resort Guest Services',
    description: 'Mountain resort hospitality and winter sports assistance',
    category: {
      id: 'hospitality-service',
      name: 'Hospitality & Service',
      description: 'Hotel, restaurant, and customer service standards',
      isActive: true
    },
    version: '1.0.0',
    tags: ['ski-resort', 'winter-sports', 'mountain', 'seasonal'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'ski-resort-service-process',
        title: 'Ski Resort Service Process',
        description: 'Mountain resort guest service standards',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'ski-equipment-assistance',
            title: 'Assist with ski equipment and lessons',
            description: 'Help guests with equipment rental and lesson booking',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['ski-equipment', 'lessons'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 30,
    difficulty: 'medium',
    requiredSkills: ['winter sports knowledge', 'equipment assistance', 'mountain safety']
  }
];
