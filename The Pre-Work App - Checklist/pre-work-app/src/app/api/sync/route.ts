import { NextRequest, NextResponse } from 'next/server';
import { AwsRealTimeSyncService } from '../../../lib/realtime/awsSyncService';
import { validateAwsConfig } from '../../../lib/database/config';

const syncService = new AwsRealTimeSyncService();

export async function GET(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const entityType = searchParams.get('entityType');

    if (entityId) {
      // Get active sessions for an entity
      const sessions = await syncService.getActiveSessions(entityId, entityType || undefined);
      return NextResponse.json({ sessions });
    }

    return NextResponse.json({ error: 'Missing required parameter: entityId' }, { status: 400 });

  } catch (error) {
    console.error('Error in sync GET:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve sync data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    validateAwsConfig();

    const {
      action,
      userId,
      userName,
      entityId,
      entityType,
      sessionId,
      operation
    } = await request.json();

    if (action === 'join_session') {
      if (!userId || !userName || !entityId || !entityType) {
        return NextResponse.json(
          { error: 'Missing required fields: userId, userName, entityId, entityType' },
          { status: 400 }
        );
      }

      const session = await syncService.joinSession(userId, userName, entityId, entityType);
      return NextResponse.json({ 
        session,
        message: 'Joined session successfully' 
      });
    }

    if (action === 'leave_session') {
      if (!sessionId || !userId) {
        return NextResponse.json(
          { error: 'Missing required fields: sessionId, userId' },
          { status: 400 }
        );
      }

      await syncService.leaveSession(sessionId, userId);
      return NextResponse.json({ 
        message: 'Left session successfully' 
      });
    }

    if (action === 'apply_operation') {
      if (!operation) {
        return NextResponse.json(
          { error: 'Missing required field: operation' },
          { status: 400 }
        );
      }

      const result = await syncService.applyOperation(operation);
      return NextResponse.json({ 
        result,
        message: 'Operation applied successfully' 
      });
    }

    if (action === 'update_cursor') {
      const { position, entityId, entityType } = await request.json();
      
      if (!userId || !entityId || !entityType || !position) {
        return NextResponse.json(
          { error: 'Missing required fields: userId, entityId, entityType, position' },
          { status: 400 }
        );
      }

      await syncService.updateCursor(userId, entityId, entityType, position);
      return NextResponse.json({ 
        message: 'Cursor updated successfully' 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: join_session, leave_session, apply_operation, update_cursor' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in sync POST:', error);
    return NextResponse.json(
      { error: 'Failed to process sync operation' },
      { status: 500 }
    );
  }
}
