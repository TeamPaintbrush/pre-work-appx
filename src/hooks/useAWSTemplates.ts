// AWS Template Management Hook
// React hook for managing templates with AWS storage

import { useState, useEffect, useCallback } from 'react';
import { templateStorageService, type StoredTemplate, type TemplateSearchOptions } from '../services/aws/TemplateStorageService';
import { templateMigrationService, type MigrationResult } from '../services/aws/TemplateMigrationService';
import { ChecklistTemplate } from '../types';

interface UseAWSTemplatesOptions {
  workspaceId: string;
  userId: string;
  autoLoad?: boolean;
  searchOptions?: Partial<TemplateSearchOptions>;
}

interface UseAWSTemplatesReturn {
  // Data
  templates: StoredTemplate[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadTemplates: () => Promise<void>;
  saveTemplate: (template: ChecklistTemplate, options?: any) => Promise<StoredTemplate | null>;
  updateTemplate: (templateId: string, updates: Partial<ChecklistTemplate>) => Promise<StoredTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  searchTemplates: (searchOptions: Partial<TemplateSearchOptions>) => Promise<StoredTemplate[]>;
  
  // Migration
  migrateTemplates: () => Promise<MigrationResult | null>;
  verifyMigration: () => Promise<any>;
  migrationStatus: MigrationResult | null;
  
  // Utilities
  refreshTemplates: () => Promise<void>;
  getTemplate: (templateId: string) => Promise<StoredTemplate | null>;
  healthCheck: () => Promise<{ dynamodb: boolean; s3: boolean }>;
}

export function useAWSTemplates({
  workspaceId,
  userId,
  autoLoad = true,
  searchOptions = {}
}: UseAWSTemplatesOptions): UseAWSTemplatesReturn {
  const [templates, setTemplates] = useState<StoredTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationResult | null>(null);

  // Load templates from AWS
  const loadTemplates = useCallback(async () => {
    if (!workspaceId || !userId) {
      setError('Workspace ID and User ID are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams: TemplateSearchOptions = {
        workspaceId,
        ...searchOptions,
      };

      const awsTemplates = await templateStorageService.searchTemplates(searchParams);
      setTemplates(awsTemplates);
      
      console.log(`✅ Loaded ${awsTemplates.length} templates from AWS`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      console.error('Failed to load templates from AWS:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId, searchOptions]);

  // Save new template to AWS
  const saveTemplate = useCallback(async (
    template: ChecklistTemplate, 
    options: any = {}
  ): Promise<StoredTemplate | null> => {
    if (!workspaceId || !userId) {
      setError('Workspace ID and User ID are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const storedTemplate = await templateStorageService.saveTemplate(template);

      // Update local state
      setTemplates(prev => [...prev, storedTemplate]);
      
      console.log(`✅ Saved template: ${template.name}`);
      return storedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      setError(errorMessage);
      console.error('Failed to save template to AWS:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId]);

  // Update existing template in AWS
  const updateTemplate = useCallback(async (
    templateId: string,
    updates: Partial<ChecklistTemplate>
  ): Promise<StoredTemplate | null> => {
    if (!workspaceId || !userId) {
      setError('Workspace ID and User ID are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedTemplate = await templateStorageService.updateTemplate(
        templateId,
        updates,
        userId
      );

      // Update local state
      setTemplates(prev =>
        prev.map(t => t.id === templateId ? updatedTemplate : t)
      );
      
      console.log(`✅ Updated template: ${updatedTemplate.name}`);
      return updatedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      console.error('Failed to update template in AWS:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId]);

  // Delete template from AWS
  const deleteTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    if (!workspaceId) {
      setError('Workspace ID is required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await templateStorageService.deleteTemplate(templateId);
      
      // Update local state
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      console.log(`✅ Deleted template: ${templateId}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      console.error('Failed to delete template from AWS:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Search templates with custom options
  const searchTemplates = useCallback(async (
    customSearchOptions: Partial<TemplateSearchOptions>
  ): Promise<StoredTemplate[]> => {
    setLoading(true);
    setError(null);

    try {
      const searchParams: TemplateSearchOptions = {
        workspaceId,
        ...searchOptions,
        ...customSearchOptions,
      };

      const results = await templateStorageService.searchTemplates(searchParams);
      console.log(`🔍 Search returned ${results.length} templates`);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search templates';
      setError(errorMessage);
      console.error('Failed to search templates:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [workspaceId, searchOptions]);

  // Get single template
  const getTemplate = useCallback(async (templateId: string): Promise<StoredTemplate | null> => {
    if (!workspaceId) {
      setError('Workspace ID is required');
      return null;
    }

    try {
      const template = await templateStorageService.getTemplate(templateId, workspaceId);
      return template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get template';
      setError(errorMessage);
      console.error('Failed to get template:', err);
      return null;
    }
  }, [workspaceId]);

  // Migrate all existing templates to AWS
  const migrateTemplates = useCallback(async (): Promise<MigrationResult | null> => {
    if (!workspaceId || !userId) {
      setError('Workspace ID and User ID are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting template migration to AWS...');
      
      const result = await templateMigrationService.migrateAllTemplates({
        workspaceId,
        userId,
        batchSize: 25,
        makePublic: false,
      });

      setMigrationStatus(result);
      
      if (result.success) {
        // Reload templates after successful migration
        await loadTemplates();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Migration failed';
      setError(errorMessage);
      console.error('Template migration failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceId, userId, loadTemplates]);

  // Verify migration
  const verifyMigration = useCallback(async () => {
    if (!workspaceId || !userId) {
      setError('Workspace ID and User ID are required');
      return null;
    }

    try {
      const verification = await templateMigrationService.verifyMigration({
        workspaceId,
        userId,
      });

      console.log('🔍 Migration verification:', verification);
      return verification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      console.error('Migration verification failed:', err);
      return null;
    }
  }, [workspaceId, userId]);

  // Refresh templates (reload)
  const refreshTemplates = useCallback(async () => {
    await loadTemplates();
  }, [loadTemplates]);

  // Health check for AWS services
  const healthCheck = useCallback(async () => {
    try {
      const health = await templateStorageService.healthCheck();
      console.log('🏥 AWS Services Health:', health);
      return health;
    } catch (err) {
      console.error('Health check failed:', err);
      return { dynamodb: false, s3: false };
    }
  }, []);

  // Auto-load templates on mount
  useEffect(() => {
    if (autoLoad && workspaceId && userId) {
      loadTemplates();
    }
  }, [autoLoad, workspaceId, userId, loadTemplates]);

  return {
    // Data
    templates,
    loading,
    error,
    
    // Actions
    loadTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    
    // Migration
    migrateTemplates,
    verifyMigration,
    migrationStatus,
    
    // Utilities
    refreshTemplates,
    getTemplate,
    healthCheck,
  };
}
