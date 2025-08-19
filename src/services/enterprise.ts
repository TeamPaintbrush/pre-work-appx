// Enterprise AWS Data Services
// Handles workspace, custom fields, workflows, and board configurations

import { 
  DynamoDBClient, 
  PutItemCommand, 
  GetItemCommand, 
  UpdateItemCommand, 
  DeleteItemCommand, 
  QueryCommand, 
  ScanCommand 
} from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand as DocQueryCommand, 
  ScanCommand as DocScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { 
  Workspace, 
  WorkspaceSettings, 
  CustomField, 
  Workflow, 
  BoardConfiguration,
  EnterpriseProject,
  EnterpriseTask,
  Dashboard,
  SyncOperation 
} from '../types/enterprise';

// AWS Configuration
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// Table Names
const TABLES = {
  WORKSPACES: process.env.WORKSPACES_TABLE || 'PreWorkApp-Workspaces',
  CUSTOM_FIELDS: process.env.CUSTOM_FIELDS_TABLE || 'PreWorkApp-CustomFields',
  WORKFLOWS: process.env.WORKFLOWS_TABLE || 'PreWorkApp-Workflows',
  BOARD_CONFIGS: process.env.BOARD_CONFIGS_TABLE || 'PreWorkApp-BoardConfigs',
  ENTERPRISE_PROJECTS: process.env.ENTERPRISE_PROJECTS_TABLE || 'PreWorkApp-EnterpriseProjects',
  ENTERPRISE_TASKS: process.env.ENTERPRISE_TASKS_TABLE || 'PreWorkApp-EnterpriseTasks',
  DASHBOARDS: process.env.DASHBOARDS_TABLE || 'PreWorkApp-Dashboards',
  SYNC_OPERATIONS: process.env.SYNC_OPERATIONS_TABLE || 'PreWorkApp-SyncOperations',
};

// ===== WORKSPACE SERVICES =====

export class WorkspaceService {
  static async createWorkspace(workspace: Workspace): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.WORKSPACES,
        Item: {
          ...workspace,
          createdAt: workspace.createdAt.toISOString(),
          updatedAt: workspace.updatedAt.toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }));
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw new Error('Failed to create workspace');
    }
  }

  static async getWorkspace(workspaceId: string): Promise<Workspace | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.WORKSPACES,
        Key: { id: workspaceId },
      }));

      if (!result.Item) return null;

      return {
        ...result.Item,
        createdAt: new Date(result.Item.createdAt),
        updatedAt: new Date(result.Item.updatedAt),
      } as Workspace;
    } catch (error) {
      console.error('Error getting workspace:', error);
      throw new Error('Failed to get workspace');
    }
  }

  static async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<void> {
    try {
      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = key === 'updatedAt' && value instanceof Date 
            ? value.toISOString() 
            : value;
        }
      }

      await docClient.send(new UpdateCommand({
        TableName: TABLES.WORKSPACES,
        Key: { id: workspaceId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }));
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw new Error('Failed to update workspace');
    }
  }

  static async listUserWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: TABLES.WORKSPACES,
        IndexName: 'ByOwner',
        KeyConditionExpression: 'ownerId = :ownerId',
        ExpressionAttributeValues: {
          ':ownerId': userId,
        },
      }));

      return (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })) as Workspace[];
    } catch (error) {
      console.error('Error listing user workspaces:', error);
      throw new Error('Failed to list workspaces');
    }
  }

  static async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.WORKSPACES,
        Key: { id: workspaceId },
      }));
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw new Error('Failed to delete workspace');
    }
  }
}

// ===== CUSTOM FIELDS SERVICES =====

export class CustomFieldService {
  static async createCustomField(customField: CustomField): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.CUSTOM_FIELDS,
        Item: {
          ...customField,
          createdAt: customField.createdAt.toISOString(),
          updatedAt: customField.updatedAt.toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }));
    } catch (error) {
      console.error('Error creating custom field:', error);
      throw new Error('Failed to create custom field');
    }
  }

  static async getCustomField(fieldId: string): Promise<CustomField | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.CUSTOM_FIELDS,
        Key: { id: fieldId },
      }));

      if (!result.Item) return null;

      return {
        ...result.Item,
        createdAt: new Date(result.Item.createdAt),
        updatedAt: new Date(result.Item.updatedAt),
      } as CustomField;
    } catch (error) {
      console.error('Error getting custom field:', error);
      throw new Error('Failed to get custom field');
    }
  }

  static async listWorkspaceCustomFields(workspaceId: string): Promise<CustomField[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: TABLES.CUSTOM_FIELDS,
        IndexName: 'ByWorkspace',
        KeyConditionExpression: 'workspaceId = :workspaceId',
        ExpressionAttributeValues: {
          ':workspaceId': workspaceId,
        },
      }));

      return (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })) as CustomField[];
    } catch (error) {
      console.error('Error listing workspace custom fields:', error);
      throw new Error('Failed to list custom fields');
    }
  }

  static async updateCustomField(fieldId: string, updates: Partial<CustomField>): Promise<void> {
    try {
      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = key === 'updatedAt' && value instanceof Date 
            ? value.toISOString() 
            : value;
        }
      }

      await docClient.send(new UpdateCommand({
        TableName: TABLES.CUSTOM_FIELDS,
        Key: { id: fieldId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }));
    } catch (error) {
      console.error('Error updating custom field:', error);
      throw new Error('Failed to update custom field');
    }
  }

  static async deleteCustomField(fieldId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.CUSTOM_FIELDS,
        Key: { id: fieldId },
      }));
    } catch (error) {
      console.error('Error deleting custom field:', error);
      throw new Error('Failed to delete custom field');
    }
  }
}

// ===== WORKFLOW SERVICES =====

export class WorkflowService {
  static async createWorkflow(workflow: Workflow): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.WORKFLOWS,
        Item: {
          ...workflow,
          createdAt: workflow.createdAt.toISOString(),
          updatedAt: workflow.updatedAt.toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }));
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create workflow');
    }
  }

  static async getWorkflow(workflowId: string): Promise<Workflow | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.WORKFLOWS,
        Key: { id: workflowId },
      }));

      if (!result.Item) return null;

      return {
        ...result.Item,
        createdAt: new Date(result.Item.createdAt),
        updatedAt: new Date(result.Item.updatedAt),
      } as Workflow;
    } catch (error) {
      console.error('Error getting workflow:', error);
      throw new Error('Failed to get workflow');
    }
  }

  static async listWorkspaceWorkflows(workspaceId: string): Promise<Workflow[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: TABLES.WORKFLOWS,
        IndexName: 'ByWorkspace',
        KeyConditionExpression: 'workspaceId = :workspaceId',
        ExpressionAttributeValues: {
          ':workspaceId': workspaceId,
        },
      }));

      return (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })) as Workflow[];
    } catch (error) {
      console.error('Error listing workspace workflows:', error);
      throw new Error('Failed to list workflows');
    }
  }

  static async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void> {
    try {
      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = key === 'updatedAt' && value instanceof Date 
            ? value.toISOString() 
            : value;
        }
      }

      await docClient.send(new UpdateCommand({
        TableName: TABLES.WORKFLOWS,
        Key: { id: workflowId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }));
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw new Error('Failed to update workflow');
    }
  }

  static async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.WORKFLOWS,
        Key: { id: workflowId },
      }));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw new Error('Failed to delete workflow');
    }
  }
}

// ===== BOARD CONFIGURATION SERVICES =====

export class BoardConfigurationService {
  static async createBoardConfiguration(config: BoardConfiguration): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.BOARD_CONFIGS,
        Item: {
          ...config,
          createdAt: config.createdAt.toISOString(),
          updatedAt: config.updatedAt.toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }));
    } catch (error) {
      console.error('Error creating board configuration:', error);
      throw new Error('Failed to create board configuration');
    }
  }

  static async getBoardConfiguration(configId: string): Promise<BoardConfiguration | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.BOARD_CONFIGS,
        Key: { id: configId },
      }));

      if (!result.Item) return null;

      return {
        ...result.Item,
        createdAt: new Date(result.Item.createdAt),
        updatedAt: new Date(result.Item.updatedAt),
      } as BoardConfiguration;
    } catch (error) {
      console.error('Error getting board configuration:', error);
      throw new Error('Failed to get board configuration');
    }
  }

  static async listWorkspaceBoardConfigurations(workspaceId: string): Promise<BoardConfiguration[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: TABLES.BOARD_CONFIGS,
        IndexName: 'ByWorkspace',
        KeyConditionExpression: 'workspaceId = :workspaceId',
        ExpressionAttributeValues: {
          ':workspaceId': workspaceId,
        },
      }));

      return (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })) as BoardConfiguration[];
    } catch (error) {
      console.error('Error listing workspace board configurations:', error);
      throw new Error('Failed to list board configurations');
    }
  }

  static async updateBoardConfiguration(configId: string, updates: Partial<BoardConfiguration>): Promise<void> {
    try {
      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = key === 'updatedAt' && value instanceof Date 
            ? value.toISOString() 
            : value;
        }
      }

      await docClient.send(new UpdateCommand({
        TableName: TABLES.BOARD_CONFIGS,
        Key: { id: configId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }));
    } catch (error) {
      console.error('Error updating board configuration:', error);
      throw new Error('Failed to update board configuration');
    }
  }

  static async deleteBoardConfiguration(configId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.BOARD_CONFIGS,
        Key: { id: configId },
      }));
    } catch (error) {
      console.error('Error deleting board configuration:', error);
      throw new Error('Failed to delete board configuration');
    }
  }
}

// ===== SYNC SERVICES =====

export class SyncService {
  static async createSyncOperation(operation: SyncOperation): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.SYNC_OPERATIONS,
        Item: {
          ...operation,
          timestamp: operation.timestamp.toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error creating sync operation:', error);
      throw new Error('Failed to create sync operation');
    }
  }

  static async getPendingSyncOperations(workspaceId: string): Promise<SyncOperation[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: TABLES.SYNC_OPERATIONS,
        IndexName: 'ByWorkspaceStatus',
        KeyConditionExpression: 'workspaceId = :workspaceId AND #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':workspaceId': workspaceId,
          ':status': 'pending',
        },
      }));

      return (result.Items || []).map(item => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })) as SyncOperation[];
    } catch (error) {
      console.error('Error getting pending sync operations:', error);
      throw new Error('Failed to get pending sync operations');
    }
  }

  static async updateSyncOperationStatus(
    operationId: string, 
    status: SyncOperation['status'], 
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateExpression = 'SET #status = :status';
      const expressionAttributeNames: Record<string, string> = {
        '#status': 'status',
      };
      const expressionAttributeValues: Record<string, any> = {
        ':status': status,
      };

      if (errorMessage) {
        expressionAttributeValues[':errorMessage'] = errorMessage;
        expressionAttributeNames['#errorMessage'] = 'errorMessage';
      }

      await docClient.send(new UpdateCommand({
        TableName: TABLES.SYNC_OPERATIONS,
        Key: { id: operationId },
        UpdateExpression: errorMessage 
          ? `${updateExpression}, #errorMessage = :errorMessage`
          : updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }));
    } catch (error) {
      console.error('Error updating sync operation status:', error);
      throw new Error('Failed to update sync operation status');
    }
  }
}

// Export all services
export {
  TABLES,
  docClient,
};
