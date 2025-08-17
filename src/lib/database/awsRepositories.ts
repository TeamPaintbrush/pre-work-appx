import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from './config';
import { User, Profile, UserSchema, ProfileSchema } from './schemas';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// AWS DynamoDB User Repository Implementation
export class AwsUserRepository {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    this.docClient = docClient;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'EmailIndex', // GSI on email field
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      }));

      if (!result.Items || result.Items.length === 0) {
        return null;
      }

      // Validate and parse the user data
      const userData = result.Items[0];
      return UserSchema.parse(userData);
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await this.docClient.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE'
        }
      }));

      if (!result.Item) {
        return null;
      }

      return UserSchema.parse(result.Item);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  async createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const userId = uuidv4();
      const now = new Date().toISOString();

      // Hash password if provided
      let passwordHash: string | undefined;
      if ('password' in userData) {
        passwordHash = await bcrypt.hash((userData as any).password, 12);
      }

      const user: User = {
        ...userData,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      // Validate user data
      const validatedUser = UserSchema.parse(user);

      // Store in DynamoDB with additional fields
      const dbItem = {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
        ...validatedUser,
        ...(passwordHash && { passwordHash }),
        // Add GSI fields for efficient querying
        GSI1PK: `EMAIL#${user.email}`,
        GSI1SK: `USER#${userId}`,
        GSI2PK: `ORG#default`, // Default organization for now
        GSI2SK: `USER#${userId}`
      };

      await this.docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: dbItem,
        ConditionExpression: 'attribute_not_exists(PK)' // Prevent duplicate users
      }));

      return validatedUser;
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('User already exists');
      }
      throw new Error('Failed to create user');
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const { userId: _, createdAt, ...updateData } = updates;
      
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

      await this.docClient.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE'
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(PK)' // Ensure user exists
      }));
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('User not found');
      }
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.docClient.send(new DeleteCommand({
        TableName: TABLES.USERS,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE'
        },
        ConditionExpression: 'attribute_exists(PK)'
      }));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('User not found');
      }
      throw new Error('Failed to delete user');
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'RoleIndex', // GSI on role field
        KeyConditionExpression: 'role = :role',
        ExpressionAttributeValues: {
          ':role': role
        }
      }));

      if (!result.Items) {
        return [];
      }

      return result.Items.map(item => UserSchema.parse(item));
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw new Error('Failed to retrieve users by role');
    }
  }

  async getActiveUsers(): Promise<User[]> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        FilterExpression: 'isActive = :active',
        ExpressionAttributeValues: {
          ':active': true
        }
      }));

      if (!result.Items) {
        return [];
      }

      return result.Items.map(item => UserSchema.parse(item));
    } catch (error) {
      console.error('Error getting active users:', error);
      throw new Error('Failed to retrieve active users');
    }
  }

  async deactivateUser(userId: string, deactivatedBy: string): Promise<void> {
    try {
      await this.updateUser(userId, { 
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      // Log user deactivation for audit trail
      console.log(`User ${userId} deactivated by ${deactivatedBy} at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw new Error('Failed to deactivate user');
    }
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'OrganizationIndex', // GSI on organizationId
        KeyConditionExpression: 'GSI2PK = :orgKey',
        ExpressionAttributeValues: {
          ':orgKey': `ORG#${organizationId}`
        }
      }));

      if (!result.Items) {
        return [];
      }

      return result.Items.map(item => UserSchema.parse(item));
    } catch (error) {
      console.error('Error getting users by organization:', error);
      throw new Error('Failed to retrieve organization users');
    }
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      }));

      if (!result.Items || result.Items.length === 0) {
        return null;
      }

      const userData = result.Items[0];
      
      // Check if password hash exists and verify
      if (userData.passwordHash && await bcrypt.compare(password, userData.passwordHash)) {
        // Remove sensitive data before returning
        const { passwordHash, ...userWithoutPassword } = userData;
        return UserSchema.parse(userWithoutPassword);
      }

      return null;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Failed to verify credentials');
    }
  }
}

// AWS DynamoDB Profile Repository Implementation
export class AwsProfileRepository {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    this.docClient = docClient;
  }

  async getProfileById(profileId: string): Promise<Profile | null> {
    try {
      const result = await this.docClient.send(new GetCommand({
        TableName: TABLES.PROFILES,
        Key: {
          PK: `PROFILE#${profileId}`,
          SK: 'METADATA'
        }
      }));

      if (!result.Item) {
        return null;
      }

      return ProfileSchema.parse(result.Item);
    } catch (error) {
      console.error('Error getting profile by ID:', error);
      throw new Error('Failed to retrieve profile');
    }
  }

  async getTeamMembers(managerId: string): Promise<Profile[]> {
    try {
      // Query profiles where managerId matches
      const result = await this.docClient.send(new QueryCommand({
        TableName: TABLES.PROFILES,
        IndexName: 'ManagerIndex', // GSI on managerId field
        KeyConditionExpression: 'managerId = :managerId',
        ExpressionAttributeValues: {
          ':managerId': managerId
        }
      }));

      if (!result.Items) {
        return [];
      }

      return result.Items.map(item => ProfileSchema.parse(item));
    } catch (error) {
      console.error('Error getting team members:', error);
      throw new Error('Failed to retrieve team members');
    }
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const result = await this.docClient.send(new GetCommand({
        TableName: TABLES.PROFILES,
        Key: {
          PK: `PROFILE#${userId}`,
          SK: 'METADATA'
        }
      }));

      if (!result.Item) {
        return null;
      }

      return ProfileSchema.parse(result.Item);
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to retrieve profile');
    }
  }

  async createProfile(profileData: Omit<Profile, 'profileId' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    try {
      const profileId = uuidv4();
      const now = new Date().toISOString();

      const profile: Profile = {
        ...profileData,
        profileId,
        createdAt: now,
        updatedAt: now,
      };

      const validatedProfile = ProfileSchema.parse(profile);

      const dbItem = {
        PK: `PROFILE#${profileData.userId}`,
        SK: 'METADATA',
        ...validatedProfile,
        // Add GSI for profile queries
        GSI1PK: `PROFILE#${profileId}`,
        GSI1SK: 'METADATA'
      };

      await this.docClient.send(new PutCommand({
        TableName: TABLES.PROFILES,
        Item: dbItem,
        ConditionExpression: 'attribute_not_exists(PK)'
      }));

      return validatedProfile;
    } catch (error: any) {
      console.error('Error creating profile:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Profile already exists for this user');
      }
      throw new Error('Failed to create profile');
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    try {
      const { profileId, userId: _, createdAt, ...updateData } = updates;

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

      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      await this.docClient.send(new UpdateCommand({
        TableName: TABLES.PROFILES,
        Key: {
          PK: `PROFILE#${userId}`,
          SK: 'METADATA'
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(PK)'
      }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Profile not found');
      }
      throw new Error('Failed to update profile');
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      await this.docClient.send(new DeleteCommand({
        TableName: TABLES.PROFILES,
        Key: {
          PK: `PROFILE#${userId}`,
          SK: 'METADATA'
        },
        ConditionExpression: 'attribute_exists(PK)'
      }));
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Profile not found');
      }
      throw new Error('Failed to delete profile');
    }
  }
}

// Export singleton instances
export const UserRepository = new AwsUserRepository();
export const ProfileRepository = new AwsProfileRepository();

// Export interfaces for type checking
export interface UserRepositoryInterface {
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(userId: string): Promise<User | null>;
  createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  verifyPassword(email: string, password: string): Promise<User | null>;
}

export interface ProfileRepositoryInterface {
  getProfileByUserId(userId: string): Promise<Profile | null>;
  createProfile(profileData: Omit<Profile, 'profileId' | 'createdAt' | 'updatedAt'>): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<void>;
  deleteProfile(userId: string): Promise<void>;
}
