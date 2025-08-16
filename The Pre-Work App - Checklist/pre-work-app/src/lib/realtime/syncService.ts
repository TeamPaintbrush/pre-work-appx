import { v4 as uuidv4 } from 'uuid';
import { createAuditLog } from '../database/audit';

export interface RealTimeEvent {
  eventId: string;
  eventType: RealTimeEventType;
  userId: string;
  entityType: 'checklist' | 'submission' | 'team' | 'assignment';
  entityId: string;
  data: Record<string, any>;
  timestamp: string;
  roomId: string;
  version: number;
}

export type RealTimeEventType = 
  | 'checklist.updated'
  | 'checklist.item.checked'
  | 'checklist.item.unchecked'
  | 'submission.created'
  | 'submission.updated'
  | 'assignment.created'
  | 'assignment.completed'
  | 'team.member.joined'
  | 'team.member.left'
  | 'user.online'
  | 'user.offline'
  | 'collaboration.cursor.moved'
  | 'collaboration.typing.started'
  | 'collaboration.typing.stopped';

export interface CollaborationSession {
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
}

export interface ConflictResolution {
  conflictId: string;
  entityId: string;
  entityType: string;
  conflictType: 'concurrent_edit' | 'version_mismatch' | 'permission_conflict';
  users: string[];
  operations: Operation[];
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: 'merge' | 'override' | 'manual';
}

export interface Operation {
  operationId: string;
  userId: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  path: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  version: number;
}

export interface SyncState {
  entityId: string;
  entityType: string;
  version: number;
  lastModified: string;
  modifiedBy: string;
  checksum: string;
  operations: Operation[];
}

class RealTimeSyncService {
  private static instance: RealTimeSyncService;
  private activeSessions: Map<string, CollaborationSession> = new Map();
  private eventListeners: Map<string, ((event: RealTimeEvent) => void)[]> = new Map();
  private syncStates: Map<string, SyncState> = new Map();
  private pendingOperations: Map<string, Operation[]> = new Map();

  static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  /**
   * Join a collaboration session
   */
  async joinSession(
    userId: string,
    userName: string,
    entityId: string,
    entityType: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<CollaborationSession> {
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    const session: CollaborationSession = {
      sessionId,
      userId,
      userName,
      entityId,
      entityType,
      joinedAt: now,
      lastActivity: now,
      isActive: true,
    };

    this.activeSessions.set(sessionId, session);

    // Broadcast user joined event
    await this.broadcastEvent({
      eventId: uuidv4(),
      eventType: 'team.member.joined',
      userId,
      entityType: entityType as any,
      entityId,
      data: {
        sessionId,
        userName,
        joinedAt: now,
      },
      timestamp: now,
      roomId: this.getRoomId(entityType, entityId),
      version: this.getCurrentVersion(entityId),
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
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    return session;
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(
    sessionId: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.isActive = false;
    this.activeSessions.delete(sessionId);

    const sessionDuration = new Date().getTime() - new Date(session.joinedAt).getTime();

    // Broadcast user left event
    await this.broadcastEvent({
      eventId: uuidv4(),
      eventType: 'team.member.left',
      userId: session.userId,
      entityType: session.entityType as any,
      entityId: session.entityId,
      data: {
        sessionId,
        userName: session.userName,
        sessionDuration,
      },
      timestamp: new Date().toISOString(),
      roomId: this.getRoomId(session.entityType, session.entityId),
      version: this.getCurrentVersion(session.entityId),
    });

    // Log session leave
    await createAuditLog({
      action: 'COLLABORATION_SESSION_LEFT',
      entityType: 'user',
      userId: session.userId,
      entityId: sessionId,
      oldValues: {
        isActive: true,
        joinedAt: session.joinedAt,
      },
      newValues: {
        isActive: false,
        sessionDuration: Math.round(sessionDuration / 1000), // in seconds
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });
  }

  /**
   * Apply operation with conflict resolution
   */
  async applyOperation(
    operation: Omit<Operation, 'operationId' | 'timestamp' | 'version'>,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<{
    success: boolean;
    operation?: Operation;
    conflict?: ConflictResolution;
    error?: string;
  }> {
    const operationId = uuidv4();
    const timestamp = new Date().toISOString();
    const currentVersion = this.getCurrentVersion(operation.path);

    const fullOperation: Operation = {
      ...operation,
      operationId,
      timestamp,
      version: currentVersion + 1,
    };

    try {
      // Check for conflicts
      const conflict = await this.detectConflict(fullOperation);
      if (conflict) {
        return {
          success: false,
          conflict,
          error: 'Operation conflicts with concurrent changes'
        };
      }

      // Apply operation
      await this.executeOperation(fullOperation);

      // Update sync state
      this.updateSyncState(operation.path, fullOperation);

      // Broadcast the change
      await this.broadcastEvent({
        eventId: uuidv4(),
        eventType: this.getEventTypeFromOperation(fullOperation),
        userId: operation.userId,
        entityType: 'checklist', // Default to checklist, should be dynamic
        entityId: operation.path,
        data: {
          operation: fullOperation,
          oldValue: operation.oldValue,
          newValue: operation.newValue,
        },
        timestamp,
        roomId: this.getRoomId('checklist', operation.path),
        version: fullOperation.version,
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
          version: fullOperation.version,
          operationType: operation.type,
        },
        ipAddress: auditData?.ipAddress,
        userAgent: auditData?.userAgent,
      });

      return {
        success: true,
        operation: fullOperation
      };

    } catch (error) {
      console.error('Error applying operation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update cursor position
   */
  async updateCursor(
    sessionId: string,
    cursor: { x: number; y: number; elementId?: string }
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.cursor = cursor;
    session.lastActivity = new Date().toISOString();

    // Broadcast cursor movement
    await this.broadcastEvent({
      eventId: uuidv4(),
      eventType: 'collaboration.cursor.moved',
      userId: session.userId,
      entityType: session.entityType as any,
      entityId: session.entityId,
      data: {
        sessionId,
        userName: session.userName,
        cursor,
      },
      timestamp: session.lastActivity,
      roomId: this.getRoomId(session.entityType, session.entityId),
      version: this.getCurrentVersion(session.entityId),
    });
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(
    roomId: string,
    callback: (event: RealTimeEvent) => void
  ): () => void {
    if (!this.eventListeners.has(roomId)) {
      this.eventListeners.set(roomId, []);
    }
    
    const listeners = this.eventListeners.get(roomId)!;
    listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get sync state for entity
   */
  getSyncState(entityId: string): SyncState | null {
    return this.syncStates.get(entityId) || null;
  }

  /**
   * Get active sessions for entity
   */
  getActiveSessions(entityId: string, entityType?: string): CollaborationSession[] {
    return Array.from(this.activeSessions.values()).filter(session => 
      session.entityId === entityId && 
      session.isActive && 
      (!entityType || session.entityType === entityType)
    );
  }

  /**
   * Force sync for entity
   */
  async forceSync(
    entityId: string,
    entityType: string,
    userId: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<SyncState> {
    // Get current state from database
    const currentState = await this.fetchEntityState(entityId, entityType);
    
    // Create new sync state
    const syncState: SyncState = {
      entityId,
      entityType,
      version: this.getCurrentVersion(entityId) + 1,
      lastModified: new Date().toISOString(),
      modifiedBy: userId,
      checksum: this.calculateChecksum(currentState),
      operations: this.pendingOperations.get(entityId) || [],
    };

    this.syncStates.set(entityId, syncState);
    this.pendingOperations.delete(entityId);

    // Log force sync
    await createAuditLog({
      action: 'FORCE_SYNC_EXECUTED',
      entityType: 'user',
      userId,
      entityId,
      newValues: {
        version: syncState.version,
        operationCount: syncState.operations.length,
        checksum: syncState.checksum,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    return syncState;
  }

  // Private helper methods
  private getRoomId(entityType: string, entityId: string): string {
    return `${entityType}:${entityId}`;
  }

  private getCurrentVersion(entityId: string): number {
    const syncState = this.syncStates.get(entityId);
    return syncState?.version || 0;
  }

  private async broadcastEvent(event: RealTimeEvent): Promise<void> {
    const listeners = this.eventListeners.get(event.roomId) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  private async detectConflict(operation: Operation): Promise<ConflictResolution | null> {
    const pendingOps = this.pendingOperations.get(operation.path) || [];
    const conflictingOps = pendingOps.filter(op => 
      op.userId !== operation.userId && 
      op.path === operation.path &&
      Math.abs(new Date(op.timestamp).getTime() - new Date(operation.timestamp).getTime()) < 5000 // 5 second window
    );

    if (conflictingOps.length > 0) {
      return {
        conflictId: uuidv4(),
        entityId: operation.path,
        entityType: 'checklist',
        conflictType: 'concurrent_edit',
        users: [operation.userId, ...conflictingOps.map(op => op.userId)],
        operations: [operation, ...conflictingOps],
      };
    }

    return null;
  }

  private async executeOperation(operation: Operation): Promise<void> {
    // Add to pending operations
    const pending = this.pendingOperations.get(operation.path) || [];
    pending.push(operation);
    this.pendingOperations.set(operation.path, pending);

    // TODO: Execute the actual operation on the data
    console.log('Executing operation:', operation);
  }

  private updateSyncState(entityId: string, operation: Operation): void {
    const existing = this.syncStates.get(entityId);
    const operations = existing ? [...existing.operations, operation] : [operation];

    const syncState: SyncState = {
      entityId,
      entityType: 'checklist', // Should be dynamic
      version: operation.version,
      lastModified: operation.timestamp,
      modifiedBy: operation.userId,
      checksum: this.calculateChecksum({ operations }),
      operations: operations.slice(-50), // Keep last 50 operations
    };

    this.syncStates.set(entityId, syncState);
  }

  private getEventTypeFromOperation(operation: Operation): RealTimeEventType {
    switch (operation.type) {
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

  private async fetchEntityState(entityId: string, entityType: string): Promise<any> {
    // TODO: Fetch actual state from database
    console.log('Fetching entity state:', { entityId, entityType });
    return {};
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation - in production use a proper hash function
    return JSON.stringify(data).length.toString(16);
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance();
export default realTimeSyncService;
