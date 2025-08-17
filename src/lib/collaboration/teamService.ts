import { v4 as uuidv4 } from 'uuid';
import { createAuditLog } from '../database/audit';
import { User } from '../database/schemas';

export interface Team {
  teamId: string;
  name: string;
  description?: string;
  organizationId: string;
  managerId: string;
  members: TeamMember[];
  settings: TeamSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: TeamRole;
  permissions: TeamPermission[];
  joinedAt: string;
  isActive: boolean;
}

export type TeamRole = 
  | 'team_lead'
  | 'senior_member'
  | 'member'
  | 'observer';

export type TeamPermission = 
  | 'checklist.assign_team'
  | 'checklist.review_team'
  | 'member.invite'
  | 'member.remove'
  | 'team.settings'
  | 'analytics.team';

export interface TeamSettings {
  visibility: 'public' | 'private' | 'organization';
  allowMemberInvites: boolean;
  requireApprovalForJoin: boolean;
  defaultPermissions: TeamPermission[];
  notificationSettings: {
    newAssignments: boolean;
    completions: boolean;
    overdue: boolean;
    teamUpdates: boolean;
  };
}

export interface TeamInvitation {
  invitationId: string;
  teamId: string;
  invitedBy: string;
  invitedEmail: string;
  role: TeamRole;
  permissions: TeamPermission[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface ChecklistAssignment {
  assignmentId: string;
  checklistId: string;
  teamId?: string;
  assignedTo: string[];
  assignedBy: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class TeamCollaborationService {
  private static instance: TeamCollaborationService;

  static getInstance(): TeamCollaborationService {
    if (!TeamCollaborationService.instance) {
      TeamCollaborationService.instance = new TeamCollaborationService();
    }
    return TeamCollaborationService.instance;
  }

  /**
   * Create a new team
   */
  async createTeam(
    teamData: Omit<Team, 'teamId' | 'members' | 'createdAt' | 'updatedAt'>,
    creatorId: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<Team> {
    const teamId = uuidv4();
    const now = new Date().toISOString();

    const team: Team = {
      ...teamData,
      teamId,
      members: [
        {
          userId: creatorId,
          teamId,
          role: 'team_lead',
          permissions: this.getPermissionsForTeamRole('team_lead'),
          joinedAt: now,
          isActive: true,
        }
      ],
      createdAt: now,
      updatedAt: now,
    };

    // TODO: Save team to database
    console.log('Creating team:', team);

    // Log team creation
    await createAuditLog({
      action: 'TEAM_CREATED',
      entityType: 'user', // Using 'user' as entityType since audit schema only supports specific types
      userId: creatorId,
      entityId: teamId,
      newValues: {
        teamName: team.name,
        organizationId: team.organizationId,
        memberCount: 1,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    return team;
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    userId: string,
    role: TeamRole,
    addedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<TeamMember> {
    const member: TeamMember = {
      userId,
      teamId,
      role,
      permissions: this.getPermissionsForTeamRole(role),
      joinedAt: new Date().toISOString(),
      isActive: true,
    };

    // TODO: Save member to database and update team
    console.log('Adding team member:', member);

    // Log member addition
    await createAuditLog({
      action: 'TEAM_MEMBER_ADDED',
      entityType: 'user',
      userId: addedBy,
      entityId: userId,
      newValues: {
        teamId,
        role,
        permissions: member.permissions,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    return member;
  }

  /**
   * Remove member from team
   */
  async removeTeamMember(
    teamId: string,
    userId: string,
    removedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    // TODO: Remove member from database
    console.log('Removing team member:', { teamId, userId, removedBy });

    // Log member removal
    await createAuditLog({
      action: 'TEAM_MEMBER_REMOVED',
      entityType: 'user',
      userId: removedBy,
      entityId: userId,
      oldValues: {
        teamId,
        wasActive: true,
      },
      newValues: {
        isActive: false,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });
  }

  /**
   * Assign checklist to team members
   */
  async assignChecklist(
    assignment: Omit<ChecklistAssignment, 'assignmentId' | 'createdAt' | 'updatedAt'>,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<ChecklistAssignment> {
    const assignmentId = uuidv4();
    const now = new Date().toISOString();

    const checklistAssignment: ChecklistAssignment = {
      ...assignment,
      assignmentId,
      createdAt: now,
      updatedAt: now,
    };

    // TODO: Save assignment to database
    console.log('Creating checklist assignment:', checklistAssignment);

    // Log assignment creation
    await createAuditLog({
      action: 'CHECKLIST_ASSIGNED',
      entityType: 'user',
      userId: assignment.assignedBy,
      entityId: assignment.checklistId,
      newValues: {
        assignmentId,
        assignedTo: assignment.assignedTo,
        teamId: assignment.teamId,
        priority: assignment.priority,
        dueDate: assignment.dueDate,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    // Notify assigned users
    for (const userId of assignment.assignedTo) {
      await this.notifyUserOfAssignment(userId, checklistAssignment);
    }

    return checklistAssignment;
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(
    assignmentId: string,
    status: ChecklistAssignment['status'],
    updatedBy: string,
    notes?: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    // TODO: Update assignment in database
    console.log('Updating assignment status:', { assignmentId, status, updatedBy, notes });

    // Log status update
    await createAuditLog({
      action: 'ASSIGNMENT_STATUS_UPDATED',
      entityType: 'user',
      userId: updatedBy,
      entityId: assignmentId,
      newValues: {
        status,
        notes,
        updatedAt: new Date().toISOString(),
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });
  }

  /**
   * Send team invitation
   */
  async sendTeamInvitation(
    teamId: string,
    invitedEmail: string,
    role: TeamRole,
    invitedBy: string,
    auditData?: { ipAddress?: string; userAgent?: string }
  ): Promise<TeamInvitation> {
    const invitationId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation: TeamInvitation = {
      invitationId,
      teamId,
      invitedBy,
      invitedEmail,
      role,
      permissions: this.getPermissionsForTeamRole(role),
      status: 'pending',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    // TODO: Save invitation to database and send email
    console.log('Creating team invitation:', invitation);

    // Log invitation creation
    await createAuditLog({
      action: 'TEAM_INVITATION_SENT',
      entityType: 'user',
      userId: invitedBy,
      entityId: invitationId,
      newValues: {
        teamId,
        invitedEmail,
        role,
        expiresAt: invitation.expiresAt,
      },
      ipAddress: auditData?.ipAddress,
      userAgent: auditData?.userAgent,
    });

    return invitation;
  }

  /**
   * Get team permissions for a role
   */
  private getPermissionsForTeamRole(role: TeamRole): TeamPermission[] {
    const rolePermissions: Record<TeamRole, TeamPermission[]> = {
      team_lead: [
        'checklist.assign_team',
        'checklist.review_team',
        'member.invite',
        'member.remove',
        'team.settings',
        'analytics.team'
      ],
      senior_member: [
        'checklist.assign_team',
        'checklist.review_team',
        'member.invite',
        'analytics.team'
      ],
      member: [
        'checklist.assign_team',
        'analytics.team'
      ],
      observer: []
    };

    return rolePermissions[role] || [];
  }

  /**
   * Check if user has team permission
   */
  hasTeamPermission(member: TeamMember, permission: TeamPermission): boolean {
    return member.permissions.includes(permission);
  }

  /**
   * Get team members by team ID
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    // TODO: Implement database query
    console.log('Getting team members for team:', teamId);
    return [];
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    // TODO: Implement database query
    console.log('Getting teams for user:', userId);
    return [];
  }

  /**
   * Get assignments for user
   */
  async getUserAssignments(userId: string, status?: ChecklistAssignment['status']): Promise<ChecklistAssignment[]> {
    // TODO: Implement database query
    console.log('Getting assignments for user:', userId, 'with status:', status);
    return [];
  }

  /**
   * Get team assignments
   */
  async getTeamAssignments(teamId: string, status?: ChecklistAssignment['status']): Promise<ChecklistAssignment[]> {
    // TODO: Implement database query
    console.log('Getting assignments for team:', teamId, 'with status:', status);
    return [];
  }

  /**
   * Notify user of new assignment
   */
  private async notifyUserOfAssignment(userId: string, assignment: ChecklistAssignment): Promise<void> {
    // TODO: Implement notification system
    console.log('Notifying user of assignment:', { userId, assignmentId: assignment.assignmentId });
  }

  /**
   * Get team analytics
   */
  async getTeamAnalytics(teamId: string, dateRange: { start: string; end: string }): Promise<{
    totalAssignments: number;
    completedAssignments: number;
    overdueAssignments: number;
    memberProductivity: { userId: string; completionRate: number }[];
    averageCompletionTime: number;
  }> {
    // TODO: Implement analytics calculation
    console.log('Getting team analytics:', { teamId, dateRange });
    return {
      totalAssignments: 0,
      completedAssignments: 0,
      overdueAssignments: 0,
      memberProductivity: [],
      averageCompletionTime: 0,
    };
  }
}

export const teamCollaborationService = TeamCollaborationService.getInstance();
export default teamCollaborationService;
