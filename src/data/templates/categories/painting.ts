import { ChecklistTemplate } from '../../../types';

export const PAINTING_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'interior-wall-painting',
    name: 'Interior Wall Painting',
    description: 'Complete interior wall painting preparation and application',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'interior', 'walls', 'residential'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'prep-and-paint',
        title: 'Preparation and Painting',
        description: 'Wall preparation and painting process',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'surface-prep',
            title: 'Surface preparation',
            description: 'Clean and prepare wall surfaces for painting',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'cleaning'],
            dependencies: []
          },
          {
            id: 'prime-walls',
            title: 'Apply primer to walls',
            description: 'Apply appropriate primer to prepared wall surfaces',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['primer', 'preparation'],
            dependencies: ['surface-prep']
          },
          {
            id: 'paint-application',
            title: 'Apply paint finish',
            description: 'Apply final paint coats with proper technique',
            isRequired: true,
            isOptional: false,
            order: 3,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['painting', 'finish'],
            dependencies: ['prime-walls']
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['painting', 'surface preparation', 'color mixing']
  },
  {
    id: 'exterior-house-painting',
    name: 'Exterior House Painting',
    description: 'Complete exterior house painting project',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'exterior', 'house', 'weatherproof'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'exterior-painting',
        title: 'Exterior Painting Process',
        description: 'Complete exterior painting workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'weather-check',
            title: 'Check weather conditions',
            description: 'Verify suitable weather conditions for exterior painting',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['weather', 'planning'],
            dependencies: []
          },
          {
            id: 'exterior-prep',
            title: 'Prepare exterior surfaces',
            description: 'Power wash, scrape, and prepare exterior surfaces',
            isRequired: true,
            isOptional: false,
            order: 2,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'exterior'],
            dependencies: ['weather-check']
          }
        ]
      }
    ],
    estimatedDuration: 480,
    difficulty: 'hard',
    requiredSkills: ['exterior painting', 'ladder safety', 'weather assessment']
  },
  {
    id: 'cabinet-painting',
    name: 'Kitchen Cabinet Painting',
    description: 'Professional kitchen cabinet refinishing and painting',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'cabinets', 'kitchen', 'refinishing'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'cabinet-process',
        title: 'Cabinet Painting Process',
        description: 'Professional cabinet painting workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'cabinet-prep',
            title: 'Prepare cabinet surfaces',
            description: 'Remove doors, clean, sand, and prepare cabinet surfaces',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'sanding'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 360,
    difficulty: 'medium',
    requiredSkills: ['cabinet refinishing', 'detail work', 'spray painting']
  },
  {
    id: 'fence-painting',
    name: 'Fence Painting & Staining',
    description: 'Fence painting and protective staining service',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'fence', 'staining', 'outdoor'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'fence-process',
        title: 'Fence Painting Process',
        description: 'Fence preparation and painting workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'fence-prep',
            title: 'Prepare fence for painting',
            description: 'Clean, repair, and prepare fence surfaces for coating',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'repair'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 300,
    difficulty: 'medium',
    requiredSkills: ['fence maintenance', 'outdoor painting', 'weather resistance']
  },
  {
    id: 'trim-painting',
    name: 'Trim & Molding Painting',
    description: 'Detailed trim and molding painting service',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'trim', 'molding', 'detail-work'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'trim-process',
        title: 'Trim Painting Process',
        description: 'Detailed trim and molding painting',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'trim-prep',
            title: 'Prepare trim and molding',
            description: 'Sand, clean, and prepare all trim surfaces for painting',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'detail'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['detail painting', 'brush work', 'precision']
  },
  {
    id: 'deck-staining',
    name: 'Deck Staining & Sealing',
    description: 'Professional deck staining and protective sealing',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['staining', 'deck', 'sealing', 'wood-protection'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'deck-process',
        title: 'Deck Staining Process',
        description: 'Complete deck staining and sealing workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'deck-prep',
            title: 'Prepare deck surface',
            description: 'Clean, sand, and prepare deck for staining application',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'cleaning'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 240,
    difficulty: 'medium',
    requiredSkills: ['deck maintenance', 'staining', 'wood treatment']
  },
  {
    id: 'ceiling-painting',
    name: 'Ceiling Painting Service',
    description: 'Professional ceiling painting and texturing',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'ceiling', 'interior', 'overhead'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'ceiling-process',
        title: 'Ceiling Painting Process',
        description: 'Professional ceiling painting technique',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'ceiling-prep',
            title: 'Prepare ceiling surface',
            description: 'Cover furniture, repair cracks, and prepare ceiling for painting',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'protection'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 200,
    difficulty: 'medium',
    requiredSkills: ['ceiling painting', 'overhead work', 'ladder safety']
  },
  {
    id: 'garage-floor-painting',
    name: 'Garage Floor Epoxy Painting',
    description: 'Garage floor preparation and epoxy coating application',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'garage', 'epoxy', 'floor-coating'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'garage-floor-process',
        title: 'Garage Floor Coating Process',
        description: 'Professional garage floor coating application',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'floor-prep',
            title: 'Prepare concrete floor',
            description: 'Clean, etch, and prepare concrete surface for epoxy application',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['preparation', 'concrete'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 360,
    difficulty: 'hard',
    requiredSkills: ['epoxy application', 'concrete preparation', 'chemical handling']
  },
  {
    id: 'wallpaper-removal-painting',
    name: 'Wallpaper Removal & Wall Painting',
    description: 'Wallpaper removal and subsequent wall painting service',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['wallpaper-removal', 'painting', 'wall-prep', 'restoration'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'wallpaper-process',
        title: 'Wallpaper Removal Process',
        description: 'Complete wallpaper removal and painting workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'wallpaper-removal',
            title: 'Remove existing wallpaper',
            description: 'Carefully remove wallpaper and adhesive residue from walls',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['removal', 'preparation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 420,
    difficulty: 'hard',
    requiredSkills: ['wallpaper removal', 'surface restoration', 'adhesive treatment']
  },
  {
    id: 'metal-surface-painting',
    name: 'Metal Surface Painting',
    description: 'Specialized painting for metal surfaces and fixtures',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'metal', 'rust-prevention', 'protective-coating'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'metal-process',
        title: 'Metal Surface Painting Process',
        description: 'Specialized metal surface coating workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'metal-prep',
            title: 'Prepare metal surfaces',
            description: 'Remove rust, clean, and prime metal surfaces for painting',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['rust-removal', 'preparation'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['metal preparation', 'rust treatment', 'specialized coatings']
  },
  {
    id: 'texture-painting',
    name: 'Textured Wall Painting',
    description: 'Specialized painting for textured wall surfaces',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'texture', 'specialty-finish', 'decorative'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'texture-process',
        title: 'Textured Surface Painting Process',
        description: 'Specialized techniques for textured surfaces',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'texture-technique',
            title: 'Apply specialized texture technique',
            description: 'Use appropriate tools and methods for textured surface coverage',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['texture', 'technique'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 200,
    difficulty: 'medium',
    requiredSkills: ['texture painting', 'specialized tools', 'surface adaptation']
  },
  {
    id: 'commercial-painting',
    name: 'Commercial Building Painting',
    description: 'Large-scale commercial building painting project',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'commercial', 'large-scale', 'professional'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'commercial-process',
        title: 'Commercial Painting Process',
        description: 'Large-scale commercial painting workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'commercial-planning',
            title: 'Plan commercial painting project',
            description: 'Coordinate schedules, materials, and safety protocols for commercial work',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['planning', 'coordination'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 720,
    difficulty: 'hard',
    requiredSkills: ['commercial painting', 'project management', 'safety compliance']
  },
  {
    id: 'touch-up-painting',
    name: 'Paint Touch-Up Service',
    description: 'Professional paint touch-up and minor repair service',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['painting', 'touch-up', 'repair', 'maintenance'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'touch-up-process',
        title: 'Paint Touch-Up Process',
        description: 'Professional paint touch-up and repair workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'identify-areas',
            title: 'Identify areas needing touch-up',
            description: 'Assess and identify all areas requiring paint touch-up or repair',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['assessment', 'identification'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 120,
    difficulty: 'easy',
    requiredSkills: ['color matching', 'detail work', 'surface repair']
  },
  {
    id: 'spray-painting',
    name: 'Professional Spray Painting',
    description: 'High-quality spray painting for various surfaces',
    category: {
      id: 'painting-decoration',
      name: 'Painting & Decoration',
      description: 'Professional painting and decorating services',
      isActive: true
    },
    version: '1.0.0',
    tags: ['spray-painting', 'professional', 'even-finish', 'efficiency'],
    isBuiltIn: true,
    createdBy: 'system',
    createdAt: new Date('2025-01-15'),
    lastModified: new Date('2025-01-15'),
    sections: [
      {
        id: 'spray-process',
        title: 'Spray Painting Process',
        description: 'Professional spray painting technique and workflow',
        isOptional: false,
        order: 1,
        items: [
          {
            id: 'spray-setup',
            title: 'Set up spray equipment',
            description: 'Prepare and calibrate spray equipment for optimal finish quality',
            isRequired: true,
            isOptional: false,
            order: 1,
            requiresPhoto: false,
            requiresNotes: false,
            tags: ['equipment', 'setup'],
            dependencies: []
          }
        ]
      }
    ],
    estimatedDuration: 180,
    difficulty: 'medium',
    requiredSkills: ['spray painting', 'equipment operation', 'finish quality control']
  }
];