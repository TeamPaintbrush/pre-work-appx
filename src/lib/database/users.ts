import { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from './config';
import { User, UserSchema, Profile, ProfileSchema } from './schemas';
import { v4 as uuidv4 } from 'uuid';
import { createAuditLog } from './audit';

export class UserRepository {
  // Create a new user
  static async createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      ...userData,
      userId: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    // Validate data
    const validatedUser = UserSchema.parse(user);

    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: validatedUser,
        ConditionExpression: 'attribute_not_exists(userId)',
      }));

      // Create audit log
      await createAuditLog({
        userId: validatedUser.userId,
        action: 'CREATE_USER',
        entityType: 'user',
        entityId: validatedUser.userId,
        newValues: validatedUser,
      });

      return validatedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { userId },
      }));

      return result.Item as User || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'EmailIndex', // Assumes GSI on email
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      }));

      return result.Items?.[0] as User || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user by email');
    }
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<User>, updatedBy: string): Promise<User> {
    const now = new Date().toISOString();
    
    // Get current user for audit trail
    const currentUser = await this.getUserById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    try {
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId },
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

      const updatedUser = result.Attributes as User;

      // Create audit log
      await createAuditLog({
        userId: updatedBy,
        action: 'UPDATE_USER',
        entityType: 'user',
        entityId: userId,
        oldValues: currentUser,
        newValues: updatedUser,
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Get users by role
  static async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'RoleIndex', // Assumes GSI on role
        KeyConditionExpression: '#role = :role',
        ExpressionAttributeNames: {
          '#role': 'role',
        },
        ExpressionAttributeValues: {
          ':role': role,
        },
      }));

      return result.Items as User[] || [];
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw new Error('Failed to get users by role');
    }
  }

  // Deactivate user (soft delete)
  static async deactivateUser(userId: string, deactivatedBy: string): Promise<void> {
    await this.updateUser(userId, { isActive: false }, deactivatedBy);
  }

  // Get all active users
  static async getActiveUsers(): Promise<User[]> {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.USERS,
        FilterExpression: 'isActive = :active',
        ExpressionAttributeValues: {
          ':active': true,
        },
      }));

      return result.Items as User[] || [];
    } catch (error) {
      console.error('Error getting active users:', error);
      throw new Error('Failed to get active users');
    }
  }
}
