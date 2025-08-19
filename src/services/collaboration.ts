// Collaboration AWS Data Services
// Team members, comments, file attachments, activity feeds, notifications

import { 
  DynamoDBClient, 
  PutItemCommand, 
  GetItemCommand, 
  UpdateItemCommand, 
  DeleteItemCommand, 
  QueryCommand, 
  ScanCommand 
} from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand as DocQueryCommand, 
  ScanCommand as DocScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { 
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  GetObjectCommandOutput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { 
  TeamMember, 
  Comment, 
  FileAttachment, 
  CollaborationSession,
  ActivityFeedItem,
  InAppNotification,
  TaskAssignment,
  ShareSettings
} from '../types/collaboration';

// AWS Configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table Names
const COLLABORATION_TABLES = {
  TEAM_MEMBERS: process.env.TEAM_MEMBERS_TABLE || 'PreWorkApp-TeamMembers',
  COMMENTS: process.env.COMMENTS_TABLE || 'PreWorkApp-Comments',
  FILE_ATTACHMENTS: process.env.FILE_ATTACHMENTS_TABLE || 'PreWorkApp-FileAttachments',
  ACTIVITY_FEED: process.env.ACTIVITY_FEED_TABLE || 'PreWorkApp-ActivityFeed',
  NOTIFICATIONS: process.env.NOTIFICATIONS_TABLE || 'PreWorkApp-Notifications',
  COLLABORATION_SESSIONS: process.env.COLLABORATION_SESSIONS_TABLE || 'PreWorkApp-CollaborationSessions',
  ASSIGNMENTS: process.env.ASSIGNMENTS_TABLE || 'PreWorkApp-Assignments',
  SHARE_SETTINGS: process.env.SHARE_SETTINGS_TABLE || 'PreWorkApp-ShareSettings',
};

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'prework-app-files';

// ===== TEAM MEMBER SERVICES =====

export class TeamMemberService {
  static async addTeamMember(member: TeamMember): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: COLLABORATION_TABLES.TEAM_MEMBERS,
        Item: {
          ...member,
          joinedAt: member.joinedAt.toISOString(),
          lastActivity: member.lastActivity.toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }));
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  static async getTeamMember(memberId: string): Promise<TeamMember | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: COLLABORATION_TABLES.TEAM_MEMBERS,
        Key: { id: memberId },
      }));

      if (!result.Item) return null;

      return {
        ...result.Item,
        joinedAt: new Date(result.Item.joinedAt),
        lastActivity: new Date(result.Item.lastActivity),
      } as TeamMember;
    } catch (error) {
      console.error('Error getting team member:', error);
      throw new Error('Failed to get team member');
    }
  }

  static async listWorkspaceMembers(workspaceId: string): Promise<TeamMember[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: COLLABORATION_TABLES.TEAM_MEMBERS,
        IndexName: 'ByWorkspace',
        KeyConditionExpression: 'workspaceId = :workspaceId',
        ExpressionAttributeValues: {
          ':workspaceId': workspaceId,
        },
      }));

      return (result.Items || []).map(item => ({
        ...item,
        joinedAt: new Date(item.joinedAt),
        lastActivity: new Date(item.lastActivity),
      })) as TeamMember[];
    } catch (error) {
      console.error('Error listing workspace members:', error);
      throw new Error('Failed to list workspace members');
    }
  }

  static async updateMemberActivity(memberId: string): Promise<void> {
    try {
      await docClient.send(new UpdateCommand({
        TableName: COLLABORATION_TABLES.TEAM_MEMBERS,
        Key: { id: memberId },
        UpdateExpression: 'SET lastActivity = :timestamp',
        ExpressionAttributeValues: {
          ':timestamp': new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error updating member activity:', error);
      throw new Error('Failed to update member activity');
    }
  }

  static async removeMember(memberId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: COLLABORATION_TABLES.TEAM_MEMBERS,
        Key: { id: memberId },
      }));
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }
}

// ===== COMMENT SERVICES =====

export class CommentService {
  static async createComment(comment: Comment): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: COLLABORATION_TABLES.COMMENTS,
        Item: {
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          resolvedAt: comment.resolvedAt?.toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }));
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  static async getComment(commentId: string): Promise<Comment | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: COLLABORATION_TABLES.COMMENTS,
        Key: { id: commentId },
      }));

      if (!result.Item) return null;

      return {
        ...result.Item,
        createdAt: new Date(result.Item.createdAt),
        updatedAt: new Date(result.Item.updatedAt),
        resolvedAt: result.Item.resolvedAt ? new Date(result.Item.resolvedAt) : undefined,
      } as Comment;
    } catch (error) {
      console.error('Error getting comment:', error);
      throw new Error('Failed to get comment');
    }
  }

  static async listEntityComments(
    entityType: string, 
    entityId: string
  ): Promise<Comment[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: COLLABORATION_TABLES.COMMENTS,
        IndexName: 'ByEntity',
        KeyConditionExpression: 'entityType = :entityType AND entityId = :entityId',
        ExpressionAttributeValues: {
          ':entityType': entityType,
          ':entityId': entityId,
        },
        ScanIndexForward: false, // Latest comments first
      }));

      return (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
      })) as Comment[];
    } catch (error) {
      console.error('Error listing entity comments:', error);
      throw new Error('Failed to list entity comments');
    }
  }

  static async updateComment(commentId: string, updates: Partial<Comment>): Promise<void> {
    try {
      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = key === 'updatedAt' && value instanceof Date 
            ? value.toISOString() 
            : value;
        }
      }

      await docClient.send(new UpdateCommand({
        TableName: COLLABORATION_TABLES.COMMENTS,
        Key: { id: commentId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }));
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
  }

  static async deleteComment(commentId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: COLLABORATION_TABLES.COMMENTS,
        Key: { id: commentId },
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }
}

// ===== FILE ATTACHMENT SERVICES =====

export class FileAttachmentService {
  static async uploadFile(
    file: Buffer, 
    fileName: string, 
    mimeType: string, 
    metadata: Partial<FileAttachment>
  ): Promise<FileAttachment> {
    try {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const s3Key = `attachments/${metadata.workspaceId}/${fileId}/${fileName}`;

      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          originalFileName: fileName,
          uploadedBy: metadata.uploadedBy || 'unknown',
          entityType: metadata.entityType || 'unknown',
          entityId: metadata.entityId || 'unknown',
        },
      }));

      const attachment: FileAttachment = {
        id: fileId,
        workspaceId: metadata.workspaceId!,
        entityType: metadata.entityType!,
        entityId: metadata.entityId!,
        fileName: fileName,
        originalFileName: fileName,
        fileSize: file.length,
        mimeType: mimeType,
        s3Key: s3Key,
        s3Bucket: S3_BUCKET,
        uploadedBy: metadata.uploadedBy!,
        uploadedAt: new Date(),
        isPublic: metadata.isPublic || false,
        accessPermissions: metadata.accessPermissions || [],
        downloadCount: 0,
        lastAccessed: new Date(),
        tags: metadata.tags || [],
        description: metadata.description,
        version: 1,
        metadata: {
          checksum: '', // Calculate in production
          virusScanStatus: 'pending',
        },
      };

      // Save metadata to DynamoDB
      await docClient.send(new PutCommand({
        TableName: COLLABORATION_TABLES.FILE_ATTACHMENTS,
        Item: {
          ...attachment,
          uploadedAt: attachment.uploadedAt.toISOString(),
          lastAccessed: attachment.lastAccessed.toISOString(),
        },
      }));

      return attachment;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async getFileAttachment(fileId: string): Promise<FileAttachment | null> {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: COLLABORATION_TABLES.FILE_ATTACHMENTS,
        Key: { id: fileId },
      }));

      if (!result.Item) return null;

      return {
        ...result.Item,
        uploadedAt: new Date(result.Item.uploadedAt),
        lastAccessed: new Date(result.Item.lastAccessed),
      } as FileAttachment;
    } catch (error) {
      console.error('Error getting file attachment:', error);
      throw new Error('Failed to get file attachment');
    }
  }

  static async getDownloadUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const attachment = await this.getFileAttachment(fileId);
      if (!attachment) throw new Error('File not found');

      // Update download count and last accessed
      await docClient.send(new UpdateCommand({
        TableName: COLLABORATION_TABLES.FILE_ATTACHMENTS,
        Key: { id: fileId },
        UpdateExpression: 'SET downloadCount = downloadCount + :inc, lastAccessed = :timestamp',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':timestamp': new Date().toISOString(),
        },
      }));

      // Generate signed URL
      const command = new GetObjectCommand({
        Bucket: attachment.s3Bucket,
        Key: attachment.s3Key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static async listEntityFiles(
    entityType: string, 
    entityId: string
  ): Promise<FileAttachment[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: COLLABORATION_TABLES.FILE_ATTACHMENTS,
        IndexName: 'ByEntity',
        KeyConditionExpression: 'entityType = :entityType AND entityId = :entityId',
        ExpressionAttributeValues: {
          ':entityType': entityType,
          ':entityId': entityId,
        },
      }));

      return (result.Items || []).map(item => ({
        ...item,
        uploadedAt: new Date(item.uploadedAt),
        lastAccessed: new Date(item.lastAccessed),
      })) as FileAttachment[];
    } catch (error) {
      console.error('Error listing entity files:', error);
      throw new Error('Failed to list entity files');
    }
  }

  static async deleteFile(fileId: string): Promise<void> {
    try {
      const attachment = await this.getFileAttachment(fileId);
      if (!attachment) throw new Error('File not found');

      // Delete from S3
      await s3Client.send(new DeleteObjectCommand({
        Bucket: attachment.s3Bucket,
        Key: attachment.s3Key,
      }));

      // Delete from DynamoDB
      await docClient.send(new DeleteCommand({
        TableName: COLLABORATION_TABLES.FILE_ATTACHMENTS,
        Key: { id: fileId },
      }));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
}

// ===== ACTIVITY FEED SERVICES =====

export class ActivityFeedService {
  static async createActivity(activity: ActivityFeedItem): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: COLLABORATION_TABLES.ACTIVITY_FEED,
        Item: {
          ...activity,
          timestamp: activity.timestamp.toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error creating activity:', error);
      throw new Error('Failed to create activity');
    }
  }

  static async getWorkspaceActivity(
    workspaceId: string, 
    limit: number = 50
  ): Promise<ActivityFeedItem[]> {
    try {
      const result = await docClient.send(new DocQueryCommand({
        TableName: COLLABORATION_TABLES.ACTIVITY_FEED,
        IndexName: 'ByWorkspace',
        KeyConditionExpression: 'workspaceId = :workspaceId',
        ExpressionAttributeValues: {
          ':workspaceId': workspaceId,
        },
        ScanIndexForward: false, // Latest activities first
        Limit: limit,
      }));

      return (result.Items || []).map(item => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })) as ActivityFeedItem[];
    } catch (error) {
      console.error('Error getting workspace activity:', error);
      throw new Error('Failed to get workspace activity');
    }
  }

  static async markActivityAsRead(activityId: string, userId: string): Promise<void> {
    try {
      await docClient.send(new UpdateCommand({
        TableName: COLLABORATION_TABLES.ACTIVITY_FEED,
        Key: { id: activityId },
        UpdateExpression: 'SET isRead = list_append(if_not_exists(isRead, :emptyList), :readStatus)',
        ExpressionAttributeValues: {
          ':emptyList': [],
          ':readStatus': [{
            userId: userId,
            readAt: new Date().toISOString(),
          }],
        },
      }));
    } catch (error) {
      console.error('Error marking activity as read:', error);
      throw new Error('Failed to mark activity as read');
    }
  }
}

// ===== NOTIFICATION SERVICES =====

export class NotificationService {
  static async createNotification(notification: InAppNotification): Promise<void> {
    try {
      await docClient.send(new PutCommand({
        TableName: COLLABORATION_TABLES.NOTIFICATIONS,
        Item: {
          ...notification,
          createdAt: notification.createdAt.toISOString(),
          readAt: notification.readAt?.toISOString(),
          expiresAt: notification.expiresAt?.toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  static async getUserNotifications(
    userId: string, 
    unreadOnly: boolean = false
  ): Promise<InAppNotification[]> {
    try {
      const filterExpression = unreadOnly ? 'isRead = :false' : undefined;
      const expressionAttributeValues = unreadOnly ? { ':false': false } : undefined;

      const result = await docClient.send(new DocQueryCommand({
        TableName: COLLABORATION_TABLES.NOTIFICATIONS,
        IndexName: 'ByUser',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: filterExpression,
        ExpressionAttributeValues: {
          ':userId': userId,
          ...expressionAttributeValues,
        },
        ScanIndexForward: false, // Latest notifications first
      }));

      return (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        readAt: item.readAt ? new Date(item.readAt) : undefined,
        expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
      })) as InAppNotification[];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await docClient.send(new UpdateCommand({
        TableName: COLLABORATION_TABLES.NOTIFICATIONS,
        Key: { id: notificationId },
        UpdateExpression: 'SET isRead = :true, readAt = :timestamp',
        ExpressionAttributeValues: {
          ':true': true,
          ':timestamp': new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }
}

// Export all services and table configurations
export {
  COLLABORATION_TABLES,
  S3_BUCKET,
  dynamoClient,
  docClient,
  s3Client,
};
