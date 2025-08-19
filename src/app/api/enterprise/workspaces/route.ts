// Enterprise Workspaces API
// GET /api/enterprise/workspaces - List user workspaces
// POST /api/enterprise/workspaces - Create new workspace
// GET /api/enterprise/workspaces/[id] - Get workspace details
// PUT /api/enterprise/workspaces/[id] - Update workspace
// DELETE /api/enterprise/workspaces/[id] - Delete workspace

import { NextRequest, NextResponse } from 'next/server';
import { WorkspaceService } from '../../../../services/enterprise';
import { Workspace } from '../../../../types/enterprise';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const workspaces = await WorkspaceService.listUserWorkspaces(userId);
    
    return NextResponse.json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, ownerId, settings } = body;

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: 'Name and owner ID are required' },
        { status: 400 }
      );
    }

    const workspace: Workspace = {
      id: uuidv4(),
      name,
      description,
      ownerId,
      settings: settings || {
        defaultView: 'list',
        allowedViews: ['list', 'kanban', 'calendar'],
        timeTracking: false,
        notifications: {
          email: true,
          inApp: true,
          desktop: false,
          mobile: false,
          digest: 'daily',
          types: ['task_assigned', 'due_date_approaching'],
        },
        integrations: {
          calendar: { enabled: false, provider: 'google', syncDirection: 'import', calendarIds: [] },
          timeTracking: { enabled: false, provider: 'built-in', autoStart: false, roundingRules: '15min' },
          communication: {
            slack: { enabled: false, webhookUrl: '', channels: [], notifications: [] },
            teams: { enabled: false, webhookUrl: '', channels: [], notifications: [] },
            email: { enabled: true, provider: 'smtp', settings: {} },
          },
          storage: { provider: 'aws_s3', settings: {}, autoSync: true },
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 480,
          ipWhitelist: [],
          dataRetention: 365,
          auditLog: true,
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256',
            keyRotation: 90,
          },
        },
      },
      customFields: [],
      workflows: [],
      boardConfigurations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await WorkspaceService.createWorkspace(workspace);

    return NextResponse.json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
