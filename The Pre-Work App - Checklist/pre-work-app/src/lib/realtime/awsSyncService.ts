import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../database/config';
import { createAuditLog } from '../database/audit';
import { v4 as uuidv4 } from 'uuid';

// AWS Session Management for Real-time Features
export interface AwsCollaborationSession {
  PK: string; // SESSION#{entityType}#{entityId}
  SK: string; // USER#{userId}
  sessionId: string;
  userId: string;
  userName: string;
  entityId: string;
  entityType: string;
  joinedAt: string;
  lastActivity: string;
  isActive: boolean;
  cursor?: {
    x: number;
    y: number;
    elementId?: string;
  };
  selection?: {
    startIndex: number;
    endIndex: number;
    elementId: string;
  };
  connectionId?: string; // For WebSocket connections
  TTL: number; // Auto-cleanup expired sessions
}

export interface AwsRealTimeEvent {
  PK: string; // EVENT#{entityType}#{entityId}
  SK: string; // TIMESTAMP#{timestamp}#{eventId}
  eventId: string;
  eventType: string;
  userId: string;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  timestamp: string;
  roomId: string;
  version: number;
  TTL: number; // Auto-cleanup old events
}

export interface AwsOperation {
  PK: string; // OPERATION#{entityId}
  SK: string; // TIMESTAMP#{timestamp}#{operationId}
  operationId: string;
  userId: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  path: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  version: number;
  TTL: number;
}

export interface AwsSyncState {
  PK: string; // SYNC#{entityId}
  SK: string; // STATE
  entityId: string;
  entityType: string;
  version: number;
  lastModified: string;
  modifiedBy: string;
  checksum: string;
  operationCount: number;
}

// AWS Real-time Sync Service Implementation
export class AwsRealTimeSyncService {
  private docClient: DynamoDBDocumentClient;
  private eventListeners: Map<string, ((event: AwsRealTimeEvent) => void)[]> = new Map();

  constructor() {
    this.docClient = docClient;
  }

  async joinSession(
    userId: string,
    userName: string,
    entityId: string,
    entityType: string,
    connectionId?: string
  ): Promise<AwsCollaborationSession> {
    try {
      const sessionId = uuidv4();
      const now = new Date().toISOString();
      const ttl = Math.floor(Date.now() / 1000) + 86400; // 24 hours

      const session: AwsCollaborationSession = {
        PK: `SESSION#${entityType}#${entityId}`,
        SK: `USER#${userId}`,
        sessionId,
        userId,
        userName,
        entityId,
        entityType,
        joinedAt: now,
        lastActivity: now,
        isActive: true,
        connectionId,
        TTL: ttl
      };

      await this.docClient.send(new PutCommand({
        TableName: TABLES.SESSIONS,
        Item: session
      }));

      // Broadcast user joined event
      await this.createEvent({
        eventType: 'team.member.joined',
        userId,
        entityType,
        entityId,
        data: {
          sessionId,
          userName,
          joinedAt: now,
        }
      });

      // Log session join
      await createAuditLog({
        action: 'COLLABORATION_SESSION_JOINED',
        entityType: 'user',
        userId,
        entityId: sessionId,
        newValues: {
          targetEntityId: entityId,
          targetEntityType: entityType,
          sessionDuration: 0,
        }
      });

      return session;
    } catch (error: any) {
      console.error('Error joining session:', error);
      throw new Error('Failed to join collaboration session');
    }
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Get session details first
      const sessionResult = await this.docClient.send(new QueryCommand({
        TableName: TABLES.SESSIONS,
        KeyConditionExpression: 'SK = :sk',
        FilterExpression: 'sessionId = :sessionId',
        ExpressionAttributeValues: {
          ':sk': `USER#${userId}`,
          ':sessionId': sessionId
        }
      }));

      if (!sessionResult.Items || sessionResult.Items.length === 0) {
        return; // Session not found
      }

      const session = sessionResult.Items[0] as AwsCollaborationSession;
      const sessionDuration = new Date().getTime() - new Date(session.joinedAt).getTime();

      // Remove session
      await this.docClient.send(new DeleteCommand({
        TableName: TABLES.SESSIONS,
        Key: {
          PK: session.PK,
          SK: session.SK
        }
      }));

      // Broadcast user left event
      await this.createEvent({
        eventType: 'team.member.left',
        userId,
        entityType: session.entityType,
        entityId: session.entityId,
        data: {
          sessionId,
          userName: session.userName,
          sessionDuration: Math.round(sessionDuration / 1000),
        }
      });

      // Log session leave
      await createAuditLog({
        action: 'COLLABORATION_SESSION_LEFT',
        entityType: 'user',
        userId,
        entityId: sessionId,
        oldValues: {
          isActive: true,
          joinedAt: session.joinedAt,
        },
        newValues: {
          isActive: false,
          sessionDuration: Math.round(sessionDuration / 1000),
        }
      });
    } catch (error: any) {
      console.error('Error leaving session:', error);
      throw new Error('Failed to leave collaboration session');
    }
  }

  async updateCursor(
    userId: string,
    entityId: string,
    entityType: string,
    cursor: { x: number; y: number; elementId?: string }
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      await this.docClient.send(new UpdateCommand({
        TableName: TABLES.SESSIONS,
        Key: {
          PK: `SESSION#${entityType}#${entityId}`,
          SK: `USER#${userId}`
        },
        UpdateExpression: 'SET cursor = :cursor, lastActivity = :now',
        ExpressionAttributeValues: {
          ':cursor': cursor,
          ':now': now
        },
        ConditionExpression: 'attribute_exists(PK)'
      }));

      // Broadcast cursor movement
      await this.createEvent({
        eventType: 'collaboration.cursor.moved',
        userId,
        entityType,
        entityId,
        data: {
          cursor,
          userName: 'User' // Would get from session in real implementation
        }
      });
    } catch (error: any) {
      console.error('Error updating cursor:', error);
      throw new Error('Failed to update cursor position');
    }
  }

  async applyOperation(operation: {
    userId: string;
    type: 'insert' | 'delete' | 'update' | 'move';
    path: string;
    oldValue?: any;
    newValue?: any;
    entityId: string;
    entityType: string;
  }): Promise<{
    success: boolean;
    operationId?: string;
    version?: number;
    error?: string;
  }> {
    try {
      const operationId = uuidv4();
      const timestamp = new Date().toISOString();
      const currentVersion = await this.getCurrentVersion(operation.entityId);
      const newVersion = currentVersion + 1;

      // Store operation
      const awsOperation: AwsOperation = {
        PK: `OPERATION#${operation.entityId}`,
        SK: `TIMESTAMP#${timestamp}#${operationId}`,
        operationId,
        userId: operation.userId,
        type: operation.type,
        path: operation.path,
        oldValue: operation.oldValue,
        newValue: operation.newValue,
        timestamp,
        version: newVersion,
        TTL: Math.floor(Date.now() / 1000) + 604800 // 7 days
      };

      await this.docClient.send(new PutCommand({
        TableName: TABLES.SESSIONS, // Using sessions table for operations too
        Item: awsOperation
      }));

      // Update sync state
      await this.updateSyncState(operation.entityId, operation.entityType, newVersion, operation.userId);

      // Broadcast the change
      await this.createEvent({
        eventType: this.getEventTypeFromOperation(operation.type),
        userId: operation.userId,
        entityType: operation.entityType,
        entityId: operation.entityId,
        data: {
          operation: awsOperation,
          oldValue: operation.oldValue,
          newValue: operation.newValue,
        }
      });

      // Log operation
      await createAuditLog({
        action: 'REALTIME_OPERATION_APPLIED',
        entityType: 'user',
        userId: operation.userId,
        entityId: operation.path,
        oldValues: {
          value: operation.oldValue,
          version: currentVersion,
        },
        newValues: {
          value: operation.newValue,
          version: newVersion,
          operationType: operation.type,
        }
      });

      return {
        success: true,
        operationId,
        version: newVersion
      };
    } catch (error: any) {
      console.error('Error applying operation:', error);
      return {
        success: false,
        error: error.message || 'Failed to apply operation'
      };
    }
  }

  async getActiveSessions(entityId: string, entityType?: string): Promise<AwsCollaborationSession[]> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.SESSIONS,
        KeyConditionExpression: 'PK = :pk',
        FilterExpression: 'isActive = :active',
        ExpressionAttributeValues: {
          ':pk': `SESSION#${entityType || 'checklist'}#${entityId}`,
          ':active': true
        }
      }));

      return (result.Items as AwsCollaborationSession[]) || [];
    } catch (error: any) {
      console.error('Error getting active sessions:', error);
      throw new Error('Failed to retrieve active sessions');
    }
  }

  async getSyncState(entityId: string): Promise<AwsSyncState | null> {
    try {
      const result = await this.docClient.send(new GetCommand({
        TableName: TABLES.SESSIONS, // Using sessions table for sync state too
        Key: {
          PK: `SYNC#${entityId}`,
          SK: 'STATE'
        }
      }));

      return (result.Item as AwsSyncState) || null;
    } catch (error: any) {
      console.error('Error getting sync state:', error);
      return null;
    }
  }

  async forceSync(
    entityId: string,
    entityType: string,
    userId: string
  ): Promise<AwsSyncState> {
    try {
      const currentVersion = await this.getCurrentVersion(entityId);
      const newVersion = currentVersion + 1;
      const now = new Date().toISOString();

      const syncState: AwsSyncState = {
        PK: `SYNC#${entityId}`,
        SK: 'STATE',
        entityId,
        entityType,
        version: newVersion,
        lastModified: now,
        modifiedBy: userId,
        checksum: this.calculateChecksum({ entityId, version: newVersion }),
        operationCount: 0
      };

      await this.docClient.send(new PutCommand({
        TableName: TABLES.SESSIONS,
        Item: syncState
      }));

      // Log force sync
      await createAuditLog({
        action: 'FORCE_SYNC_EXECUTED',
        entityType: 'user',
        userId,
        entityId,
        newValues: {
          version: syncState.version,
          operationCount: syncState.operationCount,
          checksum: syncState.checksum,
        }
      });

      return syncState;
    } catch (error: any) {
      console.error('Error forcing sync:', error);
      throw new Error('Failed to force sync');
    }
  }

  // Subscribe to real-time events (in-memory for this implementation)
  subscribe(roomId: string, callback: (event: AwsRealTimeEvent) => void): () => void {
    if (!this.eventListeners.has(roomId)) {
      this.eventListeners.set(roomId, []);
    }
    
    const listeners = this.eventListeners.get(roomId)!;
    listeners.push(callback);

    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Private helper methods
  private async createEvent(eventData: {
    eventType: string;
    userId: string;
    entityType: string;
    entityId: string;
    data: Record<string, any>;
  }): Promise<void> {
    const eventId = uuidv4();
    const timestamp = new Date().toISOString();
    const roomId = `${eventData.entityType}:${eventData.entityId}`;

    const event: AwsRealTimeEvent = {
      PK: `EVENT#${eventData.entityType}#${eventData.entityId}`,
      SK: `TIMESTAMP#${timestamp}#${eventId}`,
      eventId,
      ...eventData,
      timestamp,
      roomId,
      version: await this.getCurrentVersion(eventData.entityId),
      TTL: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    };

    await this.docClient.send(new PutCommand({
      TableName: TABLES.SESSIONS,
      Item: event
    }));

    // Broadcast to in-memory listeners
    const listeners = this.eventListeners.get(roomId) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  private async getCurrentVersion(entityId: string): Promise<number> {
    const syncState = await this.getSyncState(entityId);
    return syncState?.version || 0;
  }

  private async updateSyncState(
    entityId: string,
    entityType: string,
    version: number,
    modifiedBy: string
  ): Promise<void> {
    const now = new Date().toISOString();

    await this.docClient.send(new UpdateCommand({
      TableName: TABLES.SESSIONS,
      Key: {
        PK: `SYNC#${entityId}`,
        SK: 'STATE'
      },
      UpdateExpression: 'SET version = :version, lastModified = :now, modifiedBy = :userId, checksum = :checksum ADD operationCount :inc',
      ExpressionAttributeValues: {
        ':version': version,
        ':now': now,
        ':userId': modifiedBy,
        ':checksum': this.calculateChecksum({ entityId, version }),
        ':inc': 1
      }
    }));
  }

  private getEventTypeFromOperation(operationType: string): string {
    switch (operationType) {
      case 'insert':
        return 'checklist.updated';
      case 'update':
        return 'checklist.item.checked';
      case 'delete':
        return 'checklist.updated';
      default:
        return 'checklist.updated';
    }
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation - in production use a proper hash function
    return JSON.stringify(data).length.toString(16);
  }
}

// Export singleton instance
export const awsRealTimeSyncService = new AwsRealTimeSyncService();
