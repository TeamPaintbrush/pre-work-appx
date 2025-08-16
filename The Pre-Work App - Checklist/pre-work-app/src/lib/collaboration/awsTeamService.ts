import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../database/config';
import { createAuditLog } from '../database/audit';
import { v4 as uuidv4 } from 'uuid';

// Team-related interfaces for AWS storage
export interface AwsTeam {
  PK: string; // TEAM#{teamId}
  SK: string; // METADATA
  teamId: string;
  name: string;
  description?: string;
  organizationId: string;
  managerId: string;
  settings: {
    visibility: 'public' | 'private' | 'organization';
    allowMemberInvites: boolean;
    requireApprovalForJoin: boolean;
    defaultPermissions: string[];
    notificationSettings: {
      newAssignments: boolean;
      completions: boolean;
      overdue: boolean;
      teamUpdates: boolean;
    };
  };
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string; // ORG#{organizationId}
  GSI1SK: string; // TEAM#{teamId}
}

export interface AwsTeamMember {
  PK: string; // TEAM#{teamId}
  SK: string; // MEMBER#{userId}
  teamId: string;
  userId: string;
  role: 'team_lead' | 'senior_member' | 'member' | 'observer';
  permissions: string[];
  joinedAt: string;
  isActive: boolean;
  GSI2PK: string; // USER#{userId}
  GSI2SK: string; // TEAM#{teamId}
}

export interface AwsAssignment {
  PK: string; // ASSIGNMENT#{assignmentId}
  SK: string; // METADATA
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
  GSI1PK: string; // TEAM#{teamId} or USER#{userId}
  GSI1SK: string; // ASSIGNMENT#{assignmentId}
}

// AWS Team Service Implementation
export class AwsTeamService {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    this.docClient = docClient;
  }

  async getTeam(teamId: string): Promise<AwsTeam | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.TEAMS,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: 'METADATA'
        }
      }));

      if (!result.Item) {
        return null;
      }

      return result.Item as AwsTeam;
    } catch (error) {
      console.error('Error getting team:', error);
      throw new Error('Failed to retrieve team');
    }
  }

  async getOrganizationTeams(organizationId: string): Promise<AwsTeam[]> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.TEAMS,
        IndexName: 'OrganizationIndex',
        KeyConditionExpression: 'GSI1PK = :orgKey',
        ExpressionAttributeValues: {
          ':orgKey': `ORG#${organizationId}`
        }
      }));

      if (!result.Items) {
        return [];
      }

      return result.Items as AwsTeam[];
    } catch (error) {
      console.error('Error getting organization teams:', error);
      throw new Error('Failed to retrieve organization teams');
    }
  }

  async getUserTeams(userId: string): Promise<AwsTeam[]> {
    try {
      // First, get team memberships for the user
      const membershipResult = await docClient.send(new QueryCommand({
        TableName: TABLES.TEAMS,
        IndexName: 'UserTeamsIndex',
        KeyConditionExpression: 'GSI2PK = :userKey',
        ExpressionAttributeValues: {
          ':userKey': `USER#${userId}`
        }
      }));

      if (!membershipResult.Items || membershipResult.Items.length === 0) {
        return [];
      }

      // Get team details for each membership
      const teamIds = membershipResult.Items.map(item => item.teamId);
      const teams: AwsTeam[] = [];

      for (const teamId of teamIds) {
        const team = await this.getTeam(teamId);
        if (team) {
          teams.push(team);
        }
      }

      return teams;
    } catch (error) {
      console.error('Error getting user teams:', error);
      throw new Error('Failed to retrieve user teams');
    }
  }

  async updateTeam(teamId: string, updates: Partial<AwsTeam>): Promise<void> {
    try {
      const { PK, SK, teamId: _, createdAt, GSI1PK, GSI1SK, ...updateData } = updates;
      
      // Build update expression
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updateData).forEach(([key, value], index) => {
        const nameKey = `#attr${index}`;
        const valueKey = `:val${index}`;
        
        updateExpressions.push(`${nameKey} = ${valueKey}`);
        expressionAttributeNames[nameKey] = key;
        expressionAttributeValues[valueKey] = value;
      });

      // Always update the updatedAt field
      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      await docClient.send(new UpdateCommand({
        TableName: TABLES.TEAMS,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: 'METADATA'
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(PK)'
      }));

      // Log team update
      await createAuditLog({
        action: 'TEAM_UPDATED',
        userId: 'system', // Could be passed as parameter
        entityType: 'team',
        entityId: teamId,
        newValues: updateData
      });
    } catch (error: any) {
      console.error('Error updating team:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Team not found');
      }
      throw new Error('Failed to update team');
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    try {
      // First, remove all team members
      const members = await this.getTeamMembers(teamId);
      
      if (members.length > 0) {
        const deleteRequests = members.map(member => ({
          DeleteRequest: {
            Key: {
              PK: `TEAM#${teamId}`,
              SK: `MEMBER#${member.userId}`
            }
          }
        }));

        // Delete members in batches
        const batches = [];
        for (let i = 0; i < deleteRequests.length; i += 25) {
          batches.push(deleteRequests.slice(i, i + 25));
        }

        for (const batch of batches) {
          await docClient.send(new BatchWriteCommand({
            RequestItems: {
              [TABLES.TEAMS]: batch
            }
          }));
        }
      }

      // Delete the team itself
      await docClient.send(new DeleteCommand({
        TableName: TABLES.TEAMS,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: 'METADATA'
        },
        ConditionExpression: 'attribute_exists(PK)'
      }));

      // Log team deletion
      await createAuditLog({
        action: 'TEAM_DELETED',
        userId: 'system', // Could be passed as parameter
        entityType: 'team',
        entityId: teamId,
        oldValues: { teamId }
      });
    } catch (error: any) {
      console.error('Error deleting team:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Team not found');
      }
      throw new Error('Failed to delete team');
    }
  }

  async createTeam(teamData: {
    name: string;
    description?: string;
    organizationId: string;
    managerId: string;
    settings: AwsTeam['settings'];
  }): Promise<AwsTeam> {
    try {
      const teamId = uuidv4();
      const now = new Date().toISOString();

      const team: AwsTeam = {
        PK: `TEAM#${teamId}`,
        SK: 'METADATA',
        teamId,
        ...teamData,
        isActive: true,
        memberCount: 1,
        createdAt: now,
        updatedAt: now,
        GSI1PK: `ORG#${teamData.organizationId}`,
        GSI1SK: `TEAM#${teamId}`
      };

      // Create team leader member entry
      const teamLeader: AwsTeamMember = {
        PK: `TEAM#${teamId}`,
        SK: `MEMBER#${teamData.managerId}`,
        teamId,
        userId: teamData.managerId,
        role: 'team_lead',
        permissions: ['checklist.assign_team', 'checklist.review_team', 'member.invite', 'member.remove', 'team.settings', 'analytics.team'],
        joinedAt: now,
        isActive: true,
        GSI2PK: `USER#${teamData.managerId}`,
        GSI2SK: `TEAM#${teamId}`
      };

      // Batch write team and team leader
      await this.docClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLES.TEAMS]: [
            {
              PutRequest: {
                Item: team
              }
            },
            {
              PutRequest: {
                Item: teamLeader
              }
            }
          ]
        }
      }));

      // Log team creation
      await createAuditLog({
        action: 'TEAM_CREATED',
        entityType: 'user',
        userId: teamData.managerId,
        entityId: teamId,
        newValues: {
          teamName: teamData.name,
          organizationId: teamData.organizationId,
          memberCount: 1,
        }
      });

      return team;
    } catch (error: any) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  async addTeamMember(teamId: string, userId: string, role: AwsTeamMember['role'], addedBy: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      const member: AwsTeamMember = {
        PK: `TEAM#${teamId}`,
        SK: `MEMBER#${userId}`,
        teamId,
        userId,
        role,
        permissions: this.getPermissionsForRole(role),
        joinedAt: now,
        isActive: true,
        GSI2PK: `USER#${userId}`,
        GSI2SK: `TEAM#${teamId}`
      };

      // Add member and increment team member count
      await Promise.all([
        this.docClient.send(new PutCommand({
          TableName: TABLES.TEAMS,
          Item: member,
          ConditionExpression: 'attribute_not_exists(PK)'
        })),
        this.docClient.send(new UpdateCommand({
          TableName: TABLES.TEAMS,
          Key: {
            PK: `TEAM#${teamId}`,
            SK: 'METADATA'
          },
          UpdateExpression: 'ADD memberCount :inc SET updatedAt = :now',
          ExpressionAttributeValues: {
            ':inc': 1,
            ':now': now
          }
        }))
      ]);

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
        }
      });
    } catch (error: any) {
      console.error('Error adding team member:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('User is already a member of this team');
      }
      throw new Error('Failed to add team member');
    }
  }

  async removeTeamMember(teamId: string, userId: string, removedBy: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Remove member and decrement team member count
      await Promise.all([
        this.docClient.send(new DeleteCommand({
          TableName: TABLES.TEAMS,
          Key: {
            PK: `TEAM#${teamId}`,
            SK: `MEMBER#${userId}`
          },
          ConditionExpression: 'attribute_exists(PK)'
        })),
        this.docClient.send(new UpdateCommand({
          TableName: TABLES.TEAMS,
          Key: {
            PK: `TEAM#${teamId}`,
            SK: 'METADATA'
          },
          UpdateExpression: 'ADD memberCount :dec SET updatedAt = :now',
          ExpressionAttributeValues: {
            ':dec': -1,
            ':now': now
          }
        }))
      ]);

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
        }
      });
    } catch (error: any) {
      console.error('Error removing team member:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('User is not a member of this team');
      }
      throw new Error('Failed to remove team member');
    }
  }

  async assignChecklist(assignmentData: {
    checklistId: string;
    teamId?: string;
    assignedTo: string[];
    assignedBy: string;
    dueDate?: string;
    priority: AwsAssignment['priority'];
    notes?: string;
  }): Promise<AwsAssignment> {
    try {
      const assignmentId = uuidv4();
      const now = new Date().toISOString();

      const assignment: AwsAssignment = {
        PK: `ASSIGNMENT#${assignmentId}`,
        SK: 'METADATA',
        assignmentId,
        ...assignmentData,
        status: 'assigned',
        createdAt: now,
        updatedAt: now,
        GSI1PK: assignmentData.teamId ? `TEAM#${assignmentData.teamId}` : `USER#${assignmentData.assignedTo[0]}`,
        GSI1SK: `ASSIGNMENT#${assignmentId}`
      };

      await this.docClient.send(new PutCommand({
        TableName: TABLES.ASSIGNMENTS,
        Item: assignment
      }));

      // Log assignment creation
      await createAuditLog({
        action: 'CHECKLIST_ASSIGNED',
        entityType: 'user',
        userId: assignmentData.assignedBy,
        entityId: assignmentData.checklistId,
        newValues: {
          assignmentId,
          assignedTo: assignmentData.assignedTo,
          teamId: assignmentData.teamId,
          priority: assignmentData.priority,
          dueDate: assignmentData.dueDate,
        }
      });

      return assignment;
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  }

  async updateAssignmentStatus(
    assignmentId: string,
    status: AwsAssignment['status'],
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      await this.docClient.send(new UpdateCommand({
        TableName: TABLES.ASSIGNMENTS,
        Key: {
          PK: `ASSIGNMENT#${assignmentId}`,
          SK: 'METADATA'
        },
        UpdateExpression: 'SET #status = :status, updatedAt = :now' + (notes ? ', notes = :notes' : ''),
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':now': now,
          ...(notes && { ':notes': notes })
        },
        ConditionExpression: 'attribute_exists(PK)'
      }));

      // Log status update
      await createAuditLog({
        action: 'ASSIGNMENT_STATUS_UPDATED',
        entityType: 'user',
        userId: updatedBy,
        entityId: assignmentId,
        newValues: {
          status,
          notes,
          updatedAt: now,
        }
      });
    } catch (error: any) {
      console.error('Error updating assignment status:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Assignment not found');
      }
      throw new Error('Failed to update assignment status');
    }
  }

  async getTeamMembers(teamId: string): Promise<AwsTeamMember[]> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.TEAMS,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TEAM#${teamId}`,
          ':sk': 'MEMBER#'
        }
      }));

      return (result.Items as AwsTeamMember[]) || [];
    } catch (error: any) {
      console.error('Error getting team members:', error);
      throw new Error('Failed to retrieve team members');
    }
  }

  async getUserAssignments(userId: string, status?: AwsAssignment['status']): Promise<AwsAssignment[]> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.ASSIGNMENTS,
        IndexName: 'UserAssignmentsIndex',
        KeyConditionExpression: 'GSI1PK = :userKey',
        ...(status && {
          FilterExpression: '#status = :status',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':userKey': `USER#${userId}`,
            ':status': status
          }
        }),
        ...(!status && {
          ExpressionAttributeValues: {
            ':userKey': `USER#${userId}`
          }
        })
      }));

      return (result.Items as AwsAssignment[]) || [];
    } catch (error: any) {
      console.error('Error getting user assignments:', error);
      throw new Error('Failed to retrieve user assignments');
    }
  }

  async getTeamAssignments(teamId: string, status?: AwsAssignment['status']): Promise<AwsAssignment[]> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.ASSIGNMENTS,
        IndexName: 'TeamAssignmentsIndex',
        KeyConditionExpression: 'GSI1PK = :teamKey',
        ...(status && {
          FilterExpression: '#status = :status',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':teamKey': `TEAM#${teamId}`,
            ':status': status
          }
        }),
        ...(!status && {
          ExpressionAttributeValues: {
            ':teamKey': `TEAM#${teamId}`
          }
        })
      }));

      return (result.Items as AwsAssignment[]) || [];
    } catch (error: any) {
      console.error('Error getting team assignments:', error);
      throw new Error('Failed to retrieve team assignments');
    }
  }

  private getPermissionsForRole(role: AwsTeamMember['role']): string[] {
    const rolePermissions: Record<AwsTeamMember['role'], string[]> = {
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
}

// Export singleton instance
export const awsTeamService = new AwsTeamService();
