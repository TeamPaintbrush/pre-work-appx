import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from './config';
import { Profile, ProfileSchema } from './schemas';
import { v4 as uuidv4 } from 'uuid';
import { createAuditLog } from './audit';

export class ProfileRepository {
  // Create a new profile
  static async createProfile(profileData: Omit<Profile, 'profileId' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const now = new Date().toISOString();
    const profile: Profile = {
      ...profileData,
      profileId: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    // Validate data
    const validatedProfile = ProfileSchema.parse(profile);

    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.PROFILES,
        Item: validatedProfile,
        ConditionExpression: 'attribute_not_exists(profileId)',
      }));

      // Create audit log
      await createAuditLog({
        userId: validatedProfile.userId,
        action: 'CREATE_PROFILE',
        entityType: 'profile',
        entityId: validatedProfile.profileId,
        newValues: validatedProfile,
      });

      return validatedProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  // Get profile by user ID
  static async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.PROFILES,
        IndexName: 'UserIdIndex', // Assumes GSI on userId
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      }));

      return result.Items?.[0] as Profile || null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to get profile');
    }
  }

  // Update profile
  static async updateProfile(userId: string, updates: Partial<Profile>, updatedBy: string): Promise<Profile> {
    const now = new Date().toISOString();
    
    // Get current profile for audit trail
    const currentProfile = await this.getProfileByUserId(userId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    try {
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.PROFILES,
        Key: { profileId: currentProfile.profileId },
        UpdateExpression: 'SET #updatedAt = :updatedAt' + 
          Object.keys(updates).map(key => `, #${key} = :${key}`).join(''),
        ExpressionAttributeNames: {
          '#updatedAt': 'updatedAt',
          ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        },
        ExpressionAttributeValues: {
          ':updatedAt': now,
          ...Object.entries(updates).reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}),
        },
        ReturnValues: 'ALL_NEW',
      }));

      const updatedProfile = result.Attributes as Profile;

      // Create audit log
      await createAuditLog({
        userId: updatedBy,
        action: 'UPDATE_PROFILE',
        entityType: 'profile',
        entityId: currentProfile.profileId,
        oldValues: currentProfile,
        newValues: updatedProfile,
      });

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Get team members for a manager
  static async getTeamMembers(managerId: string): Promise<Profile[]> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.PROFILES,
        IndexName: 'ManagerIdIndex', // Assumes GSI on managerId
        KeyConditionExpression: 'managerId = :managerId',
        ExpressionAttributeValues: {
          ':managerId': managerId,
        },
      }));

      return result.Items as Profile[] || [];
    } catch (error) {
      console.error('Error getting team members:', error);
      throw new Error('Failed to get team members');
    }
  }

  // Get profile by profile ID
  static async getProfileById(profileId: string): Promise<Profile | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.PROFILES,
        Key: { profileId },
      }));

      return result.Item as Profile || null;
    } catch (error) {
      console.error('Error getting profile by ID:', error);
      throw new Error('Failed to get profile by ID');
    }
  }
}
