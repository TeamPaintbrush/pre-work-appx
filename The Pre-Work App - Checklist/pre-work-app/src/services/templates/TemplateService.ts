import { 
  TemplateVersion, 
  TemplateBuilder, 
  TemplateShare, 
  TemplateUsageAnalytics, 
  VersionChange 
} from '../../types/templates';
import { ChecklistTemplate } from '../../types';

/**
 * Enterprise Template Management Service
 * Handles template creation, versioning, sharing, and analytics
 */
export class TemplateService {
  private static instance: TemplateService;
  private templates: Map<string, ChecklistTemplate> = new Map();
  private versions: Map<string, TemplateVersion[]> = new Map();
  private shares: Map<string, TemplateShare[]> = new Map();
  private analytics: Map<string, TemplateUsageAnalytics> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  // Template CRUD Operations
  async createTemplate(template: ChecklistTemplate): Promise<ChecklistTemplate> {
    const newTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      lastModified: new Date(),
      version: '1.0.0'
    };

    this.templates.set(newTemplate.id, newTemplate);
    await this.createInitialVersion(newTemplate);
    this.saveToStorage();

    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      lastModified: new Date(),
      version: this.incrementVersion(template.version)
    };

    this.templates.set(id, updatedTemplate);
    await this.createVersion(updatedTemplate, 'Updated template');
    this.saveToStorage();

    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const template = this.templates.get(id);
    if (!template || template.isBuiltIn) {
      return false;
    }

    this.templates.delete(id);
    this.versions.delete(id);
    this.shares.delete(id);
    this.analytics.delete(id);
    this.saveToStorage();

    return true;
  }

  getTemplate(id: string): ChecklistTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): ChecklistTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(categoryId: string): ChecklistTemplate[] {
    return this.getAllTemplates().filter(t => t.category.id === categoryId);
  }

  searchTemplates(query: string, filters?: {
    category?: string;
    difficulty?: string;
    tags?: string[];
  }): ChecklistTemplate[] {
    let results = this.getAllTemplates();

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Category filter
    if (filters?.category && filters.category !== 'all') {
      results = results.filter(t => t.category.id === filters.category);
    }

    // Difficulty filter
    if (filters?.difficulty && filters.difficulty !== 'all') {
      results = results.filter(t => t.difficulty === filters.difficulty);
    }

    // Tags filter
    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter(t => 
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    return results;
  }

  // Version Management
  async createVersion(template: ChecklistTemplate, description: string): Promise<TemplateVersion> {
    const versions = this.versions.get(template.id) || [];
    const latestVersion = versions.find(v => v.isActive);
    
    const newVersion: TemplateVersion = {
      id: this.generateId(),
      templateId: template.id,
      version: template.version,
      description,
      createdBy: template.createdBy || 'system',
      createdAt: new Date(),
      isActive: true,
      isPublished: false,
      parentVersionId: latestVersion?.id,
      template: { ...template }
    };

    // Deactivate previous version
    if (latestVersion) {
      latestVersion.isActive = false;
    }

    versions.push(newVersion);
    this.versions.set(template.id, versions);
    this.saveToStorage();

    return newVersion;
  }

  private async createInitialVersion(template: ChecklistTemplate): Promise<TemplateVersion> {
    return this.createVersion(template, 'Initial version');
  }

  getTemplateVersions(templateId: string): TemplateVersion[] {
    return this.versions.get(templateId) || [];
  }

  getActiveVersion(templateId: string): TemplateVersion | undefined {
    const versions = this.versions.get(templateId) || [];
    return versions.find(v => v.isActive);
  }

  async revertToVersion(templateId: string, versionId: string): Promise<ChecklistTemplate> {
    const versions = this.versions.get(templateId) || [];
    const targetVersion = versions.find(v => v.id === versionId);
    
    if (!targetVersion) {
      throw new Error('Version not found');
    }

    const revertedTemplate = {
      ...targetVersion.template,
      version: this.incrementVersion(targetVersion.template.version),
      lastModified: new Date()
    };

    return this.updateTemplate(templateId, revertedTemplate);
  }

  // Template Sharing
  async shareTemplate(
    templateId: string, 
    shareData: Omit<TemplateShare, 'id' | 'templateId' | 'createdAt' | 'accessCount' | 'isActive'>
  ): Promise<TemplateShare> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const share: TemplateShare = {
      id: this.generateId(),
      templateId,
      ...shareData,
      createdAt: new Date(),
      accessCount: 0,
      isActive: true,
      shareLink: this.generateShareLink()
    };

    const templateShares = this.shares.get(templateId) || [];
    templateShares.push(share);
    this.shares.set(templateId, templateShares);
    this.saveToStorage();

    return share;
  }

  getTemplateShares(templateId: string): TemplateShare[] {
    return this.shares.get(templateId) || [];
  }

  async revokeShare(shareId: string): Promise<boolean> {
    // Find and update the share
    const templateIds = Array.from(this.shares.keys());
    for (const templateId of templateIds) {
      const shares = this.shares.get(templateId) || [];
      const shareIndex = shares.findIndex((s: TemplateShare) => s.id === shareId);
      if (shareIndex !== -1) {
        shares[shareIndex].isActive = false;
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // Analytics
  recordTemplateUsage(templateId: string, completionTime: number, quality: number): void {
    let analytics = this.analytics.get(templateId);
    
    if (!analytics) {
      analytics = {
        templateId,
        totalUsage: 0,
        lastUsed: new Date(),
        avgCompletionTime: 0,
        completionRate: 100,
        userFeedback: [],
        performanceMetrics: {
          avgItemTime: 0,
          bottleneckItems: [],
          skipRate: 0,
          errorRate: 0,
          qualityScore: 0
        },
        popularItems: []
      };
    }

    analytics.totalUsage++;
    analytics.lastUsed = new Date();
    analytics.avgCompletionTime = (analytics.avgCompletionTime + completionTime) / 2;
    analytics.performanceMetrics.qualityScore = (analytics.performanceMetrics.qualityScore + quality) / 2;

    this.analytics.set(templateId, analytics);
    this.saveToStorage();
  }

  getTemplateAnalytics(templateId: string): TemplateUsageAnalytics | undefined {
    return this.analytics.get(templateId);
  }

  // Utility Methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateShareLink(): string {
    return `${window.location.origin}/shared-template/${this.generateId()}`;
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  // Storage Management
  private saveToStorage(): void {
    try {
      localStorage.setItem('templates', JSON.stringify(Array.from(this.templates.entries())));
      localStorage.setItem('template_versions', JSON.stringify(Array.from(this.versions.entries())));
      localStorage.setItem('template_shares', JSON.stringify(Array.from(this.shares.entries())));
      localStorage.setItem('template_analytics', JSON.stringify(Array.from(this.analytics.entries())));
    } catch (error) {
      console.error('Failed to save templates to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const templatesData = localStorage.getItem('templates');
      if (templatesData) {
        this.templates = new Map(JSON.parse(templatesData));
      }

      const versionsData = localStorage.getItem('template_versions');
      if (versionsData) {
        this.versions = new Map(JSON.parse(versionsData));
      }

      const sharesData = localStorage.getItem('template_shares');
      if (sharesData) {
        this.shares = new Map(JSON.parse(sharesData));
      }

      const analyticsData = localStorage.getItem('template_analytics');
      if (analyticsData) {
        this.analytics = new Map(JSON.parse(analyticsData));
      }
    } catch (error) {
      console.error('Failed to load templates from storage:', error);
    }
  }

  // Export/Import
  exportTemplate(templateId: string): string {
    const template = this.getTemplate(templateId);
    const versions = this.getTemplateVersions(templateId);
    const shares = this.getTemplateShares(templateId);
    const analytics = this.getTemplateAnalytics(templateId);

    return JSON.stringify({
      template,
      versions,
      shares,
      analytics,
      exportedAt: new Date(),
      version: '1.0'
    }, null, 2);
  }

  async importTemplate(templateData: string): Promise<ChecklistTemplate> {
    try {
      const data = JSON.parse(templateData);
      const template = data.template;
      
      // Generate new IDs to avoid conflicts
      template.id = this.generateId();
      template.createdAt = new Date();
      template.lastModified = new Date();

      return this.createTemplate(template);
    } catch (error) {
      throw new Error('Invalid template data');
    }
  }
}

export const templateService = TemplateService.getInstance();
