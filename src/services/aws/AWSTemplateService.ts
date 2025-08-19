import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ChecklistTemplate } from '../../types';

/**
 * AWS DYNAMODB TEMPLATE SERVICE
 * Real-time template storage and synchronization with AWS DynamoDB
 * Maintains enterprise-grade data consistency and performance
 */

export interface TemplateStorageOptions {
  enableRealTimeSync?: boolean;
  enableVersioning?: boolean;
  enableCollaboration?: boolean;
  cacheTimeout?: number;
}

export interface TemplateFilter {
  category?: string;
  difficulty?: string;
  tags?: string[];
  search?: string;
  createdBy?: string;
  lastModifiedAfter?: Date;
}

export interface TemplateMetadata {
  id: string;
  version: string;
  createdBy: string;
  lastModifiedBy: string;
  collaborators: string[];
  isPublic: boolean;
  organizationId: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncTime: Date;
}

export class AWSTemplateService {
  private client: DynamoDBDocumentClient;
  private tableName: string;
  private metadataTableName: string;
  private cache: Map<string, ChecklistTemplate> = new Map();
  private options: TemplateStorageOptions;

  constructor(options: TemplateStorageOptions = {}) {
    this.options = {
      enableRealTimeSync: true,
      enableVersioning: true,
      enableCollaboration: true,
      cacheTimeout: 300000, // 5 minutes
      ...options
    };

    // Initialize DynamoDB client
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });

    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = process.env.DYNAMODB_TEMPLATES_TABLE || 'PreWorkApp-Templates';
    this.metadataTableName = process.env.DYNAMODB_TEMPLATE_METADATA_TABLE || 'PreWorkApp-TemplateMetadata';
  }

  /**
   * Save template to DynamoDB with versioning and conflict resolution
   */
  async saveTemplate(template: ChecklistTemplate, userId: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const templateWithMeta = {
        ...template,
        lastModified: new Date(timestamp),
        lastModifiedBy: userId,
        syncStatus: 'synced'
      };

      // Save template data
      await this.client.send(new PutCommand({
        TableName: this.tableName,
        Item: templateWithMeta,
        ConditionExpression: 'attribute_not_exists(id) OR version <= :newVersion',
        ExpressionAttributeValues: {
          ':newVersion': template.version
        }
      }));

      // Update metadata
      const metadata: TemplateMetadata = {
        id: template.id,
        version: template.version,
        createdBy: template.createdBy || userId,
        lastModifiedBy: userId,
        collaborators: [],
        isPublic: template.isBuiltIn || false,
        organizationId: process.env.ORGANIZATION_ID || 'default',
        syncStatus: 'synced',
        lastSyncTime: new Date()
      };

      await this.client.send(new PutCommand({
        TableName: this.metadataTableName,
        Item: metadata
      }));

      // Update cache
      this.cache.set(template.id, templateWithMeta);

      console.log(`Template ${template.id} saved successfully to AWS`);
    } catch (error) {
      console.error('Error saving template to AWS:', error);
      throw new Error(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve template from DynamoDB with caching
   */
  async getTemplate(templateId: string): Promise<ChecklistTemplate | null> {
    try {
      // Check cache first
      if (this.cache.has(templateId)) {
        const cached = this.cache.get(templateId)!;
        const cacheAge = Date.now() - new Date(cached.lastModified).getTime();
        if (cacheAge < this.options.cacheTimeout!) {
          return cached;
        }
      }

      // Fetch from DynamoDB
      const result = await this.client.send(new GetCommand({
        TableName: this.tableName,
        Key: { id: templateId }
      }));

      if (result.Item) {
        const template = result.Item as ChecklistTemplate;
        this.cache.set(templateId, template);
        return template;
      }

      return null;
    } catch (error) {
      console.error('Error retrieving template from AWS:', error);
      throw new Error(`Failed to retrieve template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List templates with filtering and pagination
   */
  async listTemplates(filter: TemplateFilter = {}, limit: number = 50): Promise<ChecklistTemplate[]> {
    try {
      let filterExpression = '';
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Build filter expression
      const conditions: string[] = [];

      if (filter.category) {
        conditions.push('category.id = :category');
        expressionAttributeValues[':category'] = filter.category;
      }

      if (filter.difficulty) {
        conditions.push('difficulty = :difficulty');
        expressionAttributeValues[':difficulty'] = filter.difficulty;
      }

      if (filter.search) {
        conditions.push('(contains(#name, :search) OR contains(description, :search))');
        expressionAttributeNames['#name'] = 'name';
        expressionAttributeValues[':search'] = filter.search;
      }

      if (filter.createdBy) {
        conditions.push('createdBy = :createdBy');
        expressionAttributeValues[':createdBy'] = filter.createdBy;
      }

      if (filter.lastModifiedAfter) {
        conditions.push('lastModified >= :lastModified');
        expressionAttributeValues[':lastModified'] = filter.lastModifiedAfter.toISOString();
      }

      if (conditions.length > 0) {
        filterExpression = conditions.join(' AND ');
      }

      const params: any = {
        TableName: this.tableName,
        Limit: limit
      };

      if (filterExpression) {
        params.FilterExpression = filterExpression;
        if (Object.keys(expressionAttributeNames).length > 0) {
          params.ExpressionAttributeNames = expressionAttributeNames;
        }
        if (Object.keys(expressionAttributeValues).length > 0) {
          params.ExpressionAttributeValues = expressionAttributeValues;
        }
      }

      const result = await this.client.send(new ScanCommand(params));
      const templates = (result.Items || []) as ChecklistTemplate[];

      // Update cache
      templates.forEach(template => {
        this.cache.set(template.id, template);
      });

      return templates;
    } catch (error) {
      console.error('Error listing templates from AWS:', error);
      throw new Error(`Failed to list templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update template with conflict resolution
   */
  async updateTemplate(templateId: string, updates: Partial<ChecklistTemplate>, userId: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      
      // Build update expression
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value], index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        
        updateExpression.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = value;
      });

      // Add metadata updates
      updateExpression.push('#lastModified = :lastModified', '#lastModifiedBy = :lastModifiedBy');
      expressionAttributeNames['#lastModified'] = 'lastModified';
      expressionAttributeNames['#lastModifiedBy'] = 'lastModifiedBy';
      expressionAttributeValues[':lastModified'] = timestamp;
      expressionAttributeValues[':lastModifiedBy'] = userId;

      await this.client.send(new UpdateCommand({
        TableName: this.tableName,
        Key: { id: templateId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(id)'
      }));

      // Remove from cache to force refresh
      this.cache.delete(templateId);

      console.log(`Template ${templateId} updated successfully in AWS`);
    } catch (error) {
      console.error('Error updating template in AWS:', error);
      throw new Error(`Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete template from DynamoDB
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await this.client.send(new DeleteCommand({
        TableName: this.tableName,
        Key: { id: templateId },
        ConditionExpression: 'attribute_exists(id)'
      }));

      // Delete metadata
      await this.client.send(new DeleteCommand({
        TableName: this.metadataTableName,
        Key: { id: templateId }
      }));

      // Remove from cache
      this.cache.delete(templateId);

      console.log(`Template ${templateId} deleted successfully from AWS`);
    } catch (error) {
      console.error('Error deleting template from AWS:', error);
      throw new Error(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync local templates with AWS (bulk operation)
   */
  async syncTemplates(localTemplates: ChecklistTemplate[], userId: string): Promise<void> {
    try {
      console.log(`Starting sync of ${localTemplates.length} templates to AWS...`);
      
      const batchSize = 25; // DynamoDB batch limit
      const batches = [];
      
      for (let i = 0; i < localTemplates.length; i += batchSize) {
        batches.push(localTemplates.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const promises = batch.map(template => this.saveTemplate(template, userId));
        await Promise.all(promises);
      }

      console.log('Template sync completed successfully');
    } catch (error) {
      console.error('Error syncing templates to AWS:', error);
      throw new Error(`Failed to sync templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get template metadata for collaboration features
   */
  async getTemplateMetadata(templateId: string): Promise<TemplateMetadata | null> {
    try {
      const result = await this.client.send(new GetCommand({
        TableName: this.metadataTableName,
        Key: { id: templateId }
      }));

      return result.Item as TemplateMetadata || null;
    } catch (error) {
      console.error('Error retrieving template metadata:', error);
      return null;
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Template cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const awsTemplateService = new AWSTemplateService();
