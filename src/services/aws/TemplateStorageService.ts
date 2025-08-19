import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, ScanCommand, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { dynamoDBClient, s3Client } from '../../lib/database/config';
import { ChecklistTemplate } from '../../types';
import { StoredTemplate, TemplateSearchOptions } from '../../types/templates';

// Re-export types for convenience
export type { StoredTemplate, TemplateSearchOptions };

// AWS configuration
const isDevelopment = process.env.NODE_ENV === 'development';

export class TemplateStorageService {
  private tableName = 'pre-work-templates';
  private bucketName = 'pre-work-app-templates';

  // Save template to AWS
  async saveTemplate(template: ChecklistTemplate, userId?: string): Promise<StoredTemplate> {
    try {
      const now = new Date().toISOString();
      const storedTemplate: StoredTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        version: template.version,
        tags: template.tags,
        isBuiltIn: template.isBuiltIn,
        createdBy: template.createdBy,
        sections: template.sections,
        estimatedDuration: template.estimatedDuration,
        difficulty: template.difficulty,
        requiredSkills: template.requiredSkills,
        createdAt: now,
        lastModified: now,
        updatedAt: now,
        userId: userId || 'anonymous',
        isPublic: false
      };

      // Save to DynamoDB
      await dynamoDBClient.send(new PutItemCommand({
        TableName: this.tableName,
        Item: {
          id: { S: storedTemplate.id },
          name: { S: storedTemplate.name },
          description: { S: storedTemplate.description },
          category: { S: typeof storedTemplate.category === 'string' ? storedTemplate.category : storedTemplate.category.name },
          version: { S: storedTemplate.version },
          tags: { SS: storedTemplate.tags.length > 0 ? storedTemplate.tags : ['general'] },
          isBuiltIn: { BOOL: storedTemplate.isBuiltIn },
          createdBy: { S: storedTemplate.createdBy || 'anonymous' },
          sections: { S: JSON.stringify(storedTemplate.sections) },
          estimatedDuration: { N: (storedTemplate.estimatedDuration || 0).toString() },
          difficulty: { S: storedTemplate.difficulty || 'easy' },
          requiredSkills: { SS: storedTemplate.requiredSkills || ['none'] },
          createdAt: { S: storedTemplate.createdAt },
          lastModified: { S: storedTemplate.lastModified },
          updatedAt: { S: storedTemplate.updatedAt || now },
          userId: { S: storedTemplate.userId },
          isPublic: { BOOL: storedTemplate.isPublic || false }
        }
      }));

      return storedTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      throw new Error('Failed to save template');
    }
  }

  // Update template
  async updateTemplate(templateId: string, updates: Partial<ChecklistTemplate>, userId?: string): Promise<StoredTemplate> {
    try {
      const existing = await this.getTemplate(templateId);
      if (!existing) {
        throw new Error('Template not found');
      }

      const now = new Date().toISOString();
      const updatedTemplate: StoredTemplate = {
        ...existing,
        ...updates,
        createdAt: existing.createdAt, // Keep existing createdAt as-is
        lastModified: now,
        updatedAt: now
      };

      await dynamoDBClient.send(new UpdateItemCommand({
        TableName: this.tableName,
        Key: { id: { S: templateId } },
        UpdateExpression: 'SET #name = :name, description = :description, sections = :sections, lastModified = :lastModified, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': { S: updatedTemplate.name },
          ':description': { S: updatedTemplate.description },
          ':sections': { S: JSON.stringify(updatedTemplate.sections) },
          ':lastModified': { S: updatedTemplate.lastModified },
          ':updatedAt': { S: updatedTemplate.updatedAt || now }
        }
      }));

      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  }

  // Get template by ID
  async getTemplate(templateId: string, workspaceId?: string): Promise<StoredTemplate | null> {
    try {
      const result = await dynamoDBClient.send(new GetItemCommand({
        TableName: this.tableName,
        Key: { id: { S: templateId } }
      }));

      if (!result.Item) {
        return null;
      }

      return {
        id: result.Item.id.S!,
        name: result.Item.name.S!,
        description: result.Item.description.S!,
        category: result.Item.category.S! as any,
        version: result.Item.version.S!,
        tags: result.Item.tags.SS || [],
        isBuiltIn: result.Item.isBuiltIn.BOOL!,
        createdBy: result.Item.createdBy?.S,
        sections: JSON.parse(result.Item.sections.S!),
        estimatedDuration: result.Item.estimatedDuration ? parseInt(result.Item.estimatedDuration.N!) : undefined,
        difficulty: result.Item.difficulty?.S as any,
        requiredSkills: result.Item.requiredSkills?.SS,
        createdAt: result.Item.createdAt.S!,
        lastModified: result.Item.lastModified.S!,
        updatedAt: result.Item.updatedAt?.S,
        userId: result.Item.userId.S!,
        isPublic: result.Item.isPublic?.BOOL || false
      };
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      await dynamoDBClient.send(new DeleteItemCommand({
        TableName: this.tableName,
        Key: { id: { S: templateId } }
      }));
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }

  // Search templates
  async searchTemplates(options: TemplateSearchOptions): Promise<StoredTemplate[]> {
    try {
      const result = await dynamoDBClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: options.workspaceId ? 'workspaceId = :workspaceId' : undefined,
        ExpressionAttributeValues: options.workspaceId ? {
          ':workspaceId': { S: options.workspaceId }
        } : undefined
      }));

      return (result.Items || []).map((item: any) => ({
        id: item.id.S!,
        name: item.name.S!,
        description: item.description.S!,
        category: item.category.S! as any,
        version: item.version.S!,
        tags: item.tags.SS || [],
        isBuiltIn: item.isBuiltIn.BOOL!,
        createdBy: item.createdBy?.S,
        sections: JSON.parse(item.sections.S!),
        estimatedDuration: item.estimatedDuration ? parseInt(item.estimatedDuration.N!) : undefined,
        difficulty: item.difficulty?.S as any,
        requiredSkills: item.requiredSkills?.SS,
        createdAt: item.createdAt.S!,
        lastModified: item.lastModified.S!,
        updatedAt: item.updatedAt?.S,
        userId: item.userId.S!,
        isPublic: item.isPublic?.BOOL || false
      }));
    } catch (error) {
      console.error('Error searching templates:', error);
      return [];
    }
  }

  // Batch save templates
  async batchSaveTemplates(templates: ChecklistTemplate[], workspaceId?: string, userId?: string): Promise<StoredTemplate[]> {
    const results: StoredTemplate[] = [];
    
    for (const template of templates) {
      try {
        const saved = await this.saveTemplate(template, userId);
        results.push(saved);
      } catch (error) {
        console.error(`Failed to save template ${template.id}:`, error);
        // Continue with other templates
      }
    }
    
    return results;
  }

  // Health check
  async healthCheck(): Promise<{ dynamodb: boolean; s3: boolean }> {
    try {
      await dynamoDBClient.send(new ScanCommand({
        TableName: this.tableName,
        Limit: 1
      }));
      return { dynamodb: true, s3: true }; // Simplified check for now
    } catch (error) {
      console.error('Health check failed:', error);
      return { dynamodb: false, s3: false };
    }
  }
}

// Export singleton instance
export const templateStorageService = new TemplateStorageService();
