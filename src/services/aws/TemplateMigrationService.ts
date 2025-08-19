// Template Data Migration Service
// Migrates existing template data to AWS storage

import { templateStorageService, type StoredTemplate } from './TemplateStorageService';
import { ALL_EXPANDED_TEMPLATES } from '../../data/templates/categories';
import { ChecklistTemplate } from '../../types';

interface MigrationResult {
  success: boolean;
  totalTemplates: number;
  migratedTemplates: number;
  failedTemplates: number;
  errors: string[];
  migratedData: StoredTemplate[];
}

interface MigrationOptions {
  workspaceId: string;
  userId: string;
  batchSize?: number;
  skipExisting?: boolean;
  makePublic?: boolean;
}

class TemplateMigrationService {
  private migrationResults: MigrationResult = {
    success: false,
    totalTemplates: 0,
    migratedTemplates: 0,
    failedTemplates: 0,
    errors: [],
    migratedData: [],
  };

  /**
   * Migrate all existing templates to AWS storage
   */
  async migrateAllTemplates(options: MigrationOptions): Promise<MigrationResult> {
    console.log('🚀 Starting template migration to AWS...');
    
    try {
      // Reset migration results
      this.migrationResults = {
        success: false,
        totalTemplates: 0,
        migratedTemplates: 0,
        failedTemplates: 0,
        errors: [],
        migratedData: [],
      };

      // Get all templates
      const templates = ALL_EXPANDED_TEMPLATES;
      this.migrationResults.totalTemplates = templates.length;

      console.log(`📊 Found ${templates.length} templates to migrate`);

      // Process templates in batches
      const batchSize = options.batchSize || 25;
      const batches = this.chunkArray(templates, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} templates)`);

        try {
          const migratedBatch = await templateStorageService.batchSaveTemplates(
            batch,
            options.workspaceId,
            options.userId
          );

          this.migrationResults.migratedTemplates += migratedBatch.length;
          this.migrationResults.migratedData.push(...migratedBatch);

          console.log(`✅ Successfully migrated batch ${i + 1} (${migratedBatch.length} templates)`);
        } catch (error) {
          const errorMsg = `Failed to migrate batch ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`❌ ${errorMsg}`);
          
          this.migrationResults.errors.push(errorMsg);
          this.migrationResults.failedTemplates += batch.length;

          // Try to migrate individual templates in the failed batch
          await this.migrateIndividualTemplates(batch, options);
        }

        // Add small delay between batches to avoid rate limiting
        await this.delay(1000);
      }

      // Create migration summary
      await this.createMigrationSummary(options);

      this.migrationResults.success = this.migrationResults.migratedTemplates > 0;

      console.log('🎉 Template migration completed!');
      console.log(`📈 Results: ${this.migrationResults.migratedTemplates}/${this.migrationResults.totalTemplates} templates migrated`);

      return this.migrationResults;
    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`💥 ${errorMsg}`);
      
      this.migrationResults.errors.push(errorMsg);
      this.migrationResults.success = false;
      
      return this.migrationResults;
    }
  }

  /**
   * Migrate individual templates (fallback for failed batches)
   */
  private async migrateIndividualTemplates(
    templates: ChecklistTemplate[], 
    options: MigrationOptions
  ): Promise<void> {
    console.log(`🔄 Attempting individual migration for ${templates.length} templates`);

    for (const template of templates) {
      try {
        const migratedTemplate = await templateStorageService.saveTemplate(
          template,
          options.userId
        );

        this.migrationResults.migratedTemplates++;
        this.migrationResults.migratedData.push(migratedTemplate);
        this.migrationResults.failedTemplates--;

        console.log(`✅ Individual migration successful: ${template.name}`);
      } catch (error) {
        const errorMsg = `Failed to migrate template "${template.name}": ${error instanceof Error ? error.message : String(error)}`;
        console.error(`❌ ${errorMsg}`);
        this.migrationResults.errors.push(errorMsg);
      }

      // Small delay between individual migrations
      await this.delay(200);
    }
  }

  /**
   * Create migration summary document
   */
  private async createMigrationSummary(options: MigrationOptions): Promise<void> {
    try {
      const summary = {
        migrationDate: new Date().toISOString(),
        workspaceId: options.workspaceId,
        userId: options.userId,
        totalTemplates: this.migrationResults.totalTemplates,
        migratedTemplates: this.migrationResults.migratedTemplates,
        failedTemplates: this.migrationResults.failedTemplates,
        successRate: `${((this.migrationResults.migratedTemplates / this.migrationResults.totalTemplates) * 100).toFixed(2)}%`,
        errors: this.migrationResults.errors,
        templatesByCategory: this.getTemplatesByCategory(),
      };

      // Save summary as a special template record
      await templateStorageService.saveTemplate(
        {
          id: `migration-summary-${Date.now()}`,
          name: 'Migration Summary',
          description: 'Template migration summary report',
          category: { id: 'system', name: 'System', description: 'System templates', isActive: true },
          sections: [],
          tags: ['migration', 'summary', 'system'],
          isBuiltIn: true,
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          estimatedDuration: 0,
          difficulty: 'easy' as const,
          version: '1.0.0',
        },
        'system'
      );

      console.log('📋 Migration summary saved to AWS');
    } catch (error) {
      console.error('Failed to save migration summary:', error);
    }
  }

  /**
   * Get templates grouped by category
   */
  private getTemplatesByCategory(): Record<string, number> {
    const categoryCount: Record<string, number> = {};
    
    this.migrationResults.migratedData.forEach(template => {
      const categoryName = template.category.name;
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    return categoryCount;
  }

  /**
   * Verify migration success
   */
  async verifyMigration(options: MigrationOptions): Promise<{ verified: boolean; details: any }> {
    try {
      console.log('🔍 Verifying migration...');

      // Search for all templates in the workspace
      const storedTemplates = await templateStorageService.searchTemplates({
        workspaceId: options.workspaceId,
        limit: 1000,
      });

      const originalCount = ALL_EXPANDED_TEMPLATES.length;
      const storedCount = storedTemplates.length;

      const verification = {
        verified: storedCount >= originalCount,
        originalTemplateCount: originalCount,
        storedTemplateCount: storedCount,
        missingTemplates: originalCount - storedCount,
        templatesByCategory: {} as Record<string, number>,
        healthCheck: await templateStorageService.healthCheck(),
      };

      // Group stored templates by category
      storedTemplates.forEach(template => {
        const categoryName = template.category.name;
        verification.templatesByCategory[categoryName] = 
          (verification.templatesByCategory[categoryName] || 0) + 1;
      });

      console.log(`✅ Verification complete: ${storedCount}/${originalCount} templates found in AWS`);
      
      return { verified: verification.verified, details: verification };
    } catch (error) {
      console.error('Migration verification failed:', error);
      return { 
        verified: false, 
        details: { 
          error: error instanceof Error ? error.message : String(error),
          healthCheck: await templateStorageService.healthCheck()
        } 
      };
    }
  }

  /**
   * Rollback migration (delete all migrated templates)
   */
  async rollbackMigration(options: MigrationOptions): Promise<{ success: boolean; deletedCount: number }> {
    try {
      console.log('🔄 Rolling back migration...');

      const templatesInAWS = await templateStorageService.searchTemplates({
        workspaceId: options.workspaceId,
        limit: 1000,
      });

      let deletedCount = 0;

      for (const template of templatesInAWS) {
        try {
          await templateStorageService.deleteTemplate(template.id);
          deletedCount++;
          console.log(`🗑️ Deleted template: ${template.name}`);
        } catch (error) {
          console.error(`Failed to delete template ${template.name}:`, error);
        }

        // Small delay between deletions
        await this.delay(100);
      }

      console.log(`✅ Rollback complete: ${deletedCount} templates deleted`);
      
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Rollback failed:', error);
      return { success: false, deletedCount: 0 };
    }
  }

  /**
   * Utility methods
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get migration status
   */
  getMigrationResults(): MigrationResult {
    return this.migrationResults;
  }
}

// Export service instance
export const templateMigrationService = new TemplateMigrationService();
export { type MigrationResult, type MigrationOptions };
