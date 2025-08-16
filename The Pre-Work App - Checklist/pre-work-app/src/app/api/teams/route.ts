import { NextRequest, NextResponse } from 'next/server';
import { AwsTeamService } from '../../../lib/collaboration/awsTeamService';
import { validateAwsConfig } from '../../../lib/database/config';

const teamService = new AwsTeamService();

export async function GET(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');

    if (teamId) {
      const team = await teamService.getTeam(teamId);
      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      return NextResponse.json({ team });
    }

    if (organizationId) {
      const teams = await teamService.getOrganizationTeams(organizationId);
      return NextResponse.json({ teams });
    }

    if (userId) {
      const teams = await teamService.getUserTeams(userId);
      return NextResponse.json({ teams });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });

  } catch (error) {
    console.error('Error in teams GET:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    validateAwsConfig();

    const {
      name,
      description,
      organizationId,
      managerId,
      settings
    } = await request.json();

    if (!name || !organizationId || !managerId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, organizationId, managerId' },
        { status: 400 }
      );
    }

    const team = await teamService.createTeam({
      name,
      description,
      organizationId,
      managerId,
      settings
    });

    return NextResponse.json({ 
      team,
      message: 'Team created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    validateAwsConfig();

    const { teamId, updates, updatedBy } = await request.json();

    if (!teamId || !updatedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId, updatedBy' },
        { status: 400 }
      );
    }

    await teamService.updateTeam(teamId, updates);
    
    // Get the updated team to return it
    const updatedTeam = await teamService.getTeam(teamId);
    
    return NextResponse.json({ 
      team: updatedTeam,
      message: 'Team updated successfully' 
    });

  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateAwsConfig();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Missing required parameter: teamId' },
        { status: 400 }
      );
    }

    await teamService.deleteTeam(teamId);
    
    return NextResponse.json({ 
      message: 'Team deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
