import { ChecklistTemplate } from '../../types';
import { ALL_PRESET_TEMPLATES, COMBINED_TEMPLATE_COUNT } from '../../data/presetChecklists';

/**
 * TEMPLATE INTEGRATION SERVICE
 * Manages the expanded template library while maintaining AWS storage and enterprise structure
 * Ensures all templates are properly integrated with the existing system
 */

export class TemplateIntegrationService {
  private static instance: TemplateIntegrationService;
  private templates: ChecklistTemplate[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): TemplateIntegrationService {
    if (!TemplateIntegrationService.instance) {
      TemplateIntegrationService.instance = new TemplateIntegrationService();
    }
    return TemplateIntegrationService.instance;
  }

  /**
   * Initialize the template service with expanded templates
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load all templates from the expanded library
      this.templates = [...ALL_PRESET_TEMPLATES];
      
      // Log successful initialization
      console.log('🎯 Template Integration Service Initialized');
      console.log('📊 Template Count Summary:', COMBINED_TEMPLATE_COUNT);
      console.log(`✅ Total Templates Available: ${this.templates.length}`);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Template Integration Service:', error);
      throw error;
    }
  }

  /**
   * Get all available templates
   */
  public getAllTemplates(): ChecklistTemplate[] {
    if (!this.isInitialized) {
      throw new Error('Template service not initialized. Call initialize() first.');
    }
    return this.templates;
  }

  /**
   * Get templates by category
   */
  public getTemplatesByCategory(categoryId: string): ChecklistTemplate[] {
    return this.templates.filter(template => template.category.id === categoryId);
  }

  /**
   * Get templates by industry
   */
  public getTemplatesByIndustry(industry: string): ChecklistTemplate[] {
    return this.templates.filter(template => 
      template.tags.some(tag => tag.toLowerCase().includes(industry.toLowerCase()))
    );
  }

  /**
   * Search templates by name, description, or tags
   */
  public searchTemplates(query: string): ChecklistTemplate[] {
    const searchTerm = query.toLowerCase();
    return this.templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get template by ID
   */
  public getTemplateById(id: string): ChecklistTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  /**
   * Get templates by difficulty level
   */
  public getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): ChecklistTemplate[] {
    return this.templates.filter(template => template.difficulty === difficulty);
  }

  /**
   * Get recommended templates based on user's previous usage
   */
  public getRecommendedTemplates(userHistory: string[] = [], limit = 10): ChecklistTemplate[] {
    // Simple recommendation: return popular templates from different categories
    const recommendations = new Map<string, ChecklistTemplate>();
    
    for (const template of this.templates) {
      const categoryId = template.category.id;
      if (!recommendations.has(categoryId) && !userHistory.includes(template.id)) {
        recommendations.set(categoryId, template);
      }
      if (recommendations.size >= limit) break;
    }
    
    return Array.from(recommendations.values());
  }

  /**
   * Get template statistics
   */
  public getTemplateStatistics() {
    const stats = {
      totalTemplates: this.templates.length,
      templatesByCategory: {} as Record<string, number>,
      templatesByDifficulty: {} as Record<string, number>,
      averageEstimatedDuration: 0,
      mostCommonTags: [] as string[]
    };

    // Calculate stats
    const durations: number[] = [];
    const allTags: string[] = [];
    
    for (const template of this.templates) {
      // Category stats
      const categoryId = template.category.id;
      stats.templatesByCategory[categoryId] = (stats.templatesByCategory[categoryId] || 0) + 1;
      
      // Difficulty stats
      const difficulty = template.difficulty || 'medium';
      stats.templatesByDifficulty[difficulty] = (stats.templatesByDifficulty[difficulty] || 0) + 1;
      
      // Duration stats
      if (template.estimatedDuration) {
        durations.push(template.estimatedDuration);
      }
      
      // Tag stats
      allTags.push(...template.tags);
    }

    // Calculate average duration
    if (durations.length > 0) {
      stats.averageEstimatedDuration = Math.round(
        durations.reduce((sum, duration) => sum + duration, 0) / durations.length
      );
    }

    // Calculate most common tags
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    stats.mostCommonTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    return stats;
  }

  /**
   * Validate template structure for AWS compatibility
   */
  public validateTemplate(template: ChecklistTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.category) errors.push('Template category is required');
    if (!template.sections || template.sections.length === 0) {
      errors.push('Template must have at least one section');
    }

    // Validate sections
    template.sections?.forEach((section, sectionIndex) => {
      if (!section.id) errors.push(`Section ${sectionIndex} missing ID`);
      if (!section.title) errors.push(`Section ${sectionIndex} missing title`);
      if (!section.items || section.items.length === 0) {
        errors.push(`Section ${sectionIndex} must have at least one item`);
      }

      // Validate items
      section.items?.forEach((item, itemIndex) => {
        if (!item.id) errors.push(`Section ${sectionIndex}, Item ${itemIndex} missing ID`);
        if (!item.title) errors.push(`Section ${sectionIndex}, Item ${itemIndex} missing title`);
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export template to AWS-compatible format
   */
  public exportTemplateForAWS(templateId: string): any {
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // AWS DynamoDB compatible format
    return {
      PK: `TEMPLATE#${template.id}`,
      SK: `TEMPLATE#${template.id}`,
      GSI1PK: `CATEGORY#${template.category.id}`,
      GSI1SK: `TEMPLATE#${template.name}`,
      EntityType: 'Template',
      TemplateId: template.id,
      Name: template.name,
      Description: template.description,
      Category: {
        Id: template.category.id,
        Name: template.category.name,
        Description: template.category.description,
        Icon: template.category.icon,
        Color: template.category.color
      },
      Version: template.version,
      Tags: template.tags,
      IsBuiltIn: template.isBuiltIn,
      CreatedBy: template.createdBy || 'system',
      CreatedAt: template.createdAt.toISOString(),
      LastModified: template.lastModified.toISOString(),
      EstimatedDuration: template.estimatedDuration,
      Difficulty: template.difficulty,
      RequiredSkills: template.requiredSkills || [],
      Sections: template.sections.map(section => ({
        Id: section.id,
        Title: section.title,
        Description: section.description,
        IsOptional: section.isOptional,
        Order: section.order,
        Items: section.items.map(item => ({
          Id: item.id,
          Title: item.title,
          Description: item.description,
          IsRequired: item.isRequired,
          IsOptional: item.isOptional,
          EstimatedTime: item.estimatedTime,
          RequiresPhoto: item.requiresPhoto,
          RequiresNotes: item.requiresNotes,
          Tags: item.tags,
          Instructions: item.instructions,
          WarningMessage: item.warningMessage,
          Dependencies: item.dependencies,
          Order: item.order
        }))
      })),
      TTL: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
    };
  }

  /**
   * Get initialization status
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get template count summary
   */
  public getTemplateCounts() {
    return COMBINED_TEMPLATE_COUNT;
  }
}

// Export singleton instance
export const templateIntegrationService = TemplateIntegrationService.getInstance();
