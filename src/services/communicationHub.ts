// AWS Services for Communication & Collaboration Hub
// Messaging, file storage, real-time features, knowledge base

import { DynamoDBClient, QueryCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand, BatchWriteItemCommand, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  CommunicationChannel,
  ChatMessage,
  VideoCall,
  Whiteboard,
  KnowledgeBase,
  KBArticle,
  SearchQuery,
  SearchResults,
  MessageAttachment,
  CallRecording,
  WhiteboardElement,
  ArticleComment
} from '../types/communicationHub';

class CommunicationHubService {
  private dynamoClient: DynamoDBClient;
  private s3Client: S3Client;

  constructor() {
    const region = process.env.REGION || process.env.NEXT_PUBLIC_REGION || process.env.AWS_REGION || 'us-east-1';
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    };

    this.dynamoClient = new DynamoDBClient({ region, credentials });
    this.s3Client = new S3Client({ region, credentials });
  }

  // ==================== COMMUNICATION CHANNELS ====================

  async createChannel(channel: Omit<CommunicationChannel, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>): Promise<CommunicationChannel> {
    const newChannel: CommunicationChannel = {
      ...channel,
      id: `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        messageCount: 0,
        memberCount: channel.members.length,
        lastActivity: new Date(),
        tags: [],
        pinnedMessages: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dynamoClient.send(new PutItemCommand({
      TableName: process.env.CHANNELS_TABLE || 'prework-channels',
      Item: marshall(newChannel),
    }));

    return newChannel;
  }

  async getChannelsByWorkspace(workspaceId: string, userId?: string): Promise<CommunicationChannel[]> {
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.CHANNELS_TABLE || 'prework-channels',
      IndexName: 'workspace-index',
      KeyConditionExpression: 'workspaceId = :workspaceId',
      ExpressionAttributeValues: marshall({
        ':workspaceId': workspaceId,
      }),
    }));

    let channels = result.Items?.map(item => unmarshall(item) as CommunicationChannel) || [];

    // Filter by user permissions if userId provided
    if (userId) {
      channels = channels.filter(channel => 
        channel.visibility === 'public' || 
        channel.members.some(member => member.userId === userId)
      );
    }

    return channels;
  }

  async addChannelMember(channelId: string, member: any): Promise<void> {
    // Get current channel
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.CHANNELS_TABLE || 'prework-channels',
      KeyConditionExpression: 'id = :channelId',
      ExpressionAttributeValues: marshall({
        ':channelId': channelId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const channel = unmarshall(result.Items[0]) as CommunicationChannel;
      const updatedMembers = [...channel.members, member];

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.CHANNELS_TABLE || 'prework-channels',
        Key: marshall({ id: channelId }),
        UpdateExpression: 'SET members = :members, metadata.memberCount = :memberCount, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':members': updatedMembers,
          ':memberCount': updatedMembers.length,
          ':updatedAt': new Date(),
        }),
      }));
    }
  }

  async updateChannelLastActivity(channelId: string): Promise<void> {
    await this.dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.CHANNELS_TABLE || 'prework-channels',
      Key: marshall({ id: channelId }),
      UpdateExpression: 'SET metadata.lastActivity = :lastActivity, updatedAt = :updatedAt',
      ExpressionAttributeValues: marshall({
        ':lastActivity': new Date(),
        ':updatedAt': new Date(),
      }),
    }));
  }

  // ==================== CHAT MESSAGES ====================

  async sendMessage(message: Omit<ChatMessage, 'id' | 'createdAt' | 'status' | 'reactions' | 'editHistory'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      reactions: [],
      editHistory: [],
      createdAt: new Date(),
    };

    // Store message
    await this.dynamoClient.send(new PutItemCommand({
      TableName: process.env.MESSAGES_TABLE || 'prework-messages',
      Item: marshall(newMessage),
    }));

    // Update channel message count and last activity
    await this.incrementChannelMessageCount(message.channelId);
    await this.updateChannelLastActivity(message.channelId);

    return newMessage;
  }

  async getMessagesByChannel(channelId: string, limit = 50, lastMessageId?: string): Promise<ChatMessage[]> {
            const params: any = {
      TableName: process.env.MESSAGES_TABLE || 'prework-messages',
      IndexName: 'channel-created-index',
      KeyConditionExpression: 'channelId = :channelId',
      ExpressionAttributeValues: marshall({
        ':channelId': channelId,
      }),
      ScanIndexForward: false, // Latest messages first
      Limit: limit,
    };

    if (lastMessageId) {
      // Add pagination
      params.ExclusiveStartKey = marshall({
        channelId,
        id: lastMessageId,
      });
    }

    const result = await this.dynamoClient.send(new QueryCommand(params));
    return result.Items?.map(item => unmarshall(item) as ChatMessage) || [];
  }

  async updateMessage(messageId: string, content: any, editedBy: string): Promise<void> {
    // Get current message to save edit history
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.MESSAGES_TABLE || 'prework-messages',
      KeyConditionExpression: 'id = :messageId',
      ExpressionAttributeValues: marshall({
        ':messageId': messageId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const message = unmarshall(result.Items[0]) as ChatMessage;
      const editEntry = {
        content: message.content,
        editedBy,
        editedAt: new Date(),
      };

      const updatedEditHistory = [...message.editHistory, editEntry];

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.MESSAGES_TABLE || 'prework-messages',
        Key: marshall({ id: messageId }),
        UpdateExpression: 'SET content = :content, editHistory = :editHistory, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':content': content,
          ':editHistory': updatedEditHistory,
          ':updatedAt': new Date(),
        }),
      }));
    }
  }

  async addMessageReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    // Get current message
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.MESSAGES_TABLE || 'prework-messages',
      KeyConditionExpression: 'id = :messageId',
      ExpressionAttributeValues: marshall({
        ':messageId': messageId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const message = unmarshall(result.Items[0]) as ChatMessage;
      const reactions = [...message.reactions];
      
      // Find existing reaction or create new one
      const existingReaction = reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (!existingReaction.users.includes(userId)) {
          existingReaction.users.push(userId);
          existingReaction.count += 1;
        }
      } else {
        reactions.push({
          emoji,
          users: [userId],
          count: 1,
        });
      }

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.MESSAGES_TABLE || 'prework-messages',
        Key: marshall({ id: messageId }),
        UpdateExpression: 'SET reactions = :reactions',
        ExpressionAttributeValues: marshall({
          ':reactions': reactions,
        }),
      }));
    }
  }

  private async incrementChannelMessageCount(channelId: string): Promise<void> {
    await this.dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.CHANNELS_TABLE || 'prework-channels',
      Key: marshall({ id: channelId }),
      UpdateExpression: 'ADD metadata.messageCount :inc',
      ExpressionAttributeValues: marshall({
        ':inc': 1,
      }),
    }));
  }

  // ==================== FILE ATTACHMENTS ====================

  async uploadMessageAttachment(file: Buffer, fileName: string, mimeType: string, channelId: string, messageId?: string): Promise<MessageAttachment> {
    const fileKey = `attachments/${channelId}/${messageId || 'temp'}/${Date.now()}_${fileName}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.ATTACHMENTS_BUCKET || 'prework-attachments',
      Key: fileKey,
      Body: file,
      ContentType: mimeType,
    }));

    const attachment: MessageAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: fileName,
      url: fileKey,
      type: this.determineAttachmentType(mimeType),
      size: file.length,
      mimeType,
    };

    return attachment;
  }

  async getAttachmentUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.ATTACHMENTS_BUCKET || 'prework-attachments',
      Key: fileKey,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  private determineAttachmentType(mimeType: string): any {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }

  // ==================== VIDEO CALLS ====================

  async createVideoCall(call: Omit<VideoCall, 'id' | 'createdAt'>): Promise<VideoCall> {
    const newCall: VideoCall = {
      ...call,
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    await this.dynamoClient.send(new PutItemCommand({
      TableName: process.env.VIDEO_CALLS_TABLE || 'prework-video-calls',
      Item: marshall(newCall),
    }));

    return newCall;
  }

  async getCallsByWorkspace(workspaceId: string): Promise<VideoCall[]> {
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.VIDEO_CALLS_TABLE || 'prework-video-calls',
      IndexName: 'workspace-index',
      KeyConditionExpression: 'workspaceId = :workspaceId',
      ExpressionAttributeValues: marshall({
        ':workspaceId': workspaceId,
      }),
    }));

    return result.Items?.map(item => unmarshall(item) as VideoCall) || [];
  }

  async updateCallStatus(callId: string, status: string): Promise<void> {
    const updateFields: any = {
      ':status': status,
    };

    let updateExpression = 'SET #status = :status';

    if (status === 'active') {
      updateFields[':startedAt'] = new Date();
      updateExpression += ', startedAt = :startedAt';
    } else if (status === 'ended') {
      updateFields[':endedAt'] = new Date();
      updateExpression += ', endedAt = :endedAt';
    }

    await this.dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.VIDEO_CALLS_TABLE || 'prework-video-calls',
      Key: marshall({ id: callId }),
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: marshall(updateFields),
    }));
  }

  async addCallParticipant(callId: string, participant: any): Promise<void> {
    // Get current call
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.VIDEO_CALLS_TABLE || 'prework-video-calls',
      KeyConditionExpression: 'id = :callId',
      ExpressionAttributeValues: marshall({
        ':callId': callId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const call = unmarshall(result.Items[0]) as VideoCall;
      const updatedParticipants = [...call.participants, participant];

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.VIDEO_CALLS_TABLE || 'prework-video-calls',
        Key: marshall({ id: callId }),
        UpdateExpression: 'SET participants = :participants',
        ExpressionAttributeValues: marshall({
          ':participants': updatedParticipants,
        }),
      }));
    }
  }

  // ==================== WHITEBOARDS ====================

  async createWhiteboard(whiteboard: Omit<Whiteboard, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Promise<Whiteboard> {
    const newWhiteboard: Whiteboard = {
      ...whiteboard,
      id: `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      history: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dynamoClient.send(new PutItemCommand({
      TableName: process.env.WHITEBOARDS_TABLE || 'prework-whiteboards',
      Item: marshall(newWhiteboard),
    }));

    return newWhiteboard;
  }

  async getWhiteboardsByWorkspace(workspaceId: string): Promise<Whiteboard[]> {
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.WHITEBOARDS_TABLE || 'prework-whiteboards',
      IndexName: 'workspace-index',
      KeyConditionExpression: 'workspaceId = :workspaceId',
      ExpressionAttributeValues: marshall({
        ':workspaceId': workspaceId,
      }),
    }));

    return result.Items?.map(item => unmarshall(item) as Whiteboard) || [];
  }

  async updateWhiteboardElement(whiteboardId: string, element: WhiteboardElement, userId: string): Promise<void> {
    // Get current whiteboard
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.WHITEBOARDS_TABLE || 'prework-whiteboards',
      KeyConditionExpression: 'id = :whiteboardId',
      ExpressionAttributeValues: marshall({
        ':whiteboardId': whiteboardId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const whiteboard = unmarshall(result.Items[0]) as Whiteboard;
      
      // Update or add element
      const elementIndex = whiteboard.canvas.elements.findIndex(e => e.id === element.id);
      if (elementIndex >= 0) {
        whiteboard.canvas.elements[elementIndex] = element;
      } else {
        whiteboard.canvas.elements.push(element);
      }

      // Add to history
      const action = {
        id: `action_${Date.now()}`,
        type: elementIndex >= 0 ? 'update' : 'create' as any,
        userId,
        elementId: element.id,
        data: { element },
        timestamp: new Date(),
      };
      whiteboard.history.push(action);

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.WHITEBOARDS_TABLE || 'prework-whiteboards',
        Key: marshall({ id: whiteboardId }),
        UpdateExpression: 'SET canvas.elements = :elements, history = :history, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':elements': whiteboard.canvas.elements,
          ':history': whiteboard.history,
          ':updatedAt': new Date(),
        }),
      }));
    }
  }

  async addWhiteboardCollaborator(whiteboardId: string, collaborator: any): Promise<void> {
    // Get current whiteboard
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.WHITEBOARDS_TABLE || 'prework-whiteboards',
      KeyConditionExpression: 'id = :whiteboardId',
      ExpressionAttributeValues: marshall({
        ':whiteboardId': whiteboardId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const whiteboard = unmarshall(result.Items[0]) as Whiteboard;
      const updatedCollaborators = [...whiteboard.collaborators, collaborator];

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.WHITEBOARDS_TABLE || 'prework-whiteboards',
        Key: marshall({ id: whiteboardId }),
        UpdateExpression: 'SET collaborators = :collaborators, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':collaborators': updatedCollaborators,
          ':updatedAt': new Date(),
        }),
      }));
    }
  }

  // ==================== KNOWLEDGE BASE ====================

  async createKnowledgeBase(kb: Omit<KnowledgeBase, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>): Promise<KnowledgeBase> {
    const newKB: KnowledgeBase = {
      ...kb,
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        articleCount: 0,
        categoryCount: kb.structure.categories.length,
        spaceCount: kb.structure.spaces.length,
        collaboratorCount: 0,
        totalViews: 0,
        averageRating: 0,
        lastActivity: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dynamoClient.send(new PutItemCommand({
      TableName: process.env.KNOWLEDGE_BASE_TABLE || 'prework-knowledge-base',
      Item: marshall(newKB),
    }));

    return newKB;
  }

  async createArticle(article: Omit<KBArticle, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'comments' | 'reactions'>): Promise<KBArticle> {
    const newArticle: KBArticle = {
      ...article,
      id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      versions: [],
      comments: [],
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dynamoClient.send(new PutItemCommand({
      TableName: process.env.KB_ARTICLES_TABLE || 'prework-kb-articles',
      Item: marshall(newArticle),
    }));

    // Update knowledge base article count
    await this.incrementKBArticleCount(article.knowledgeBaseId);

    return newArticle;
  }

  async getArticlesByKnowledgeBase(knowledgeBaseId: string, spaceId?: string, categoryId?: string): Promise<KBArticle[]> {
    let filterExpression = 'knowledgeBaseId = :kbId';
    const expressionAttributeValues: any = {
      ':kbId': knowledgeBaseId,
    };

    if (spaceId) {
      filterExpression += ' AND spaceId = :spaceId';
      expressionAttributeValues[':spaceId'] = spaceId;
    }

    if (categoryId) {
      filterExpression += ' AND categoryId = :categoryId';
      expressionAttributeValues[':categoryId'] = categoryId;
    }

    const result = await this.dynamoClient.send(new ScanCommand({
      TableName: process.env.KB_ARTICLES_TABLE || 'prework-kb-articles',
      FilterExpression: filterExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    }));

    return result.Items?.map(item => unmarshall(item) as KBArticle) || [];
  }

  async updateArticleContent(articleId: string, content: any, authorId: string): Promise<void> {
    // Get current article to save version
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.KB_ARTICLES_TABLE || 'prework-kb-articles',
      KeyConditionExpression: 'id = :articleId',
      ExpressionAttributeValues: marshall({
        ':articleId': articleId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const article = unmarshall(result.Items[0]) as KBArticle;
      
      // Create new version
      const version = {
        id: `version_${Date.now()}`,
        version: `v${article.versions.length + 1}`,
        title: article.title,
        content: article.content,
        summary: article.summary,
        changes: ['Content updated'],
        authorId,
        createdAt: new Date(),
        isPublished: article.status === 'published',
      };

      const updatedVersions = [...article.versions, version];

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.KB_ARTICLES_TABLE || 'prework-kb-articles',
        Key: marshall({ id: articleId }),
        UpdateExpression: 'SET content = :content, versions = :versions, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':content': content,
          ':versions': updatedVersions,
          ':updatedAt': new Date(),
        }),
      }));
    }
  }

  async addArticleComment(articleId: string, comment: Omit<ArticleComment, 'id' | 'createdAt' | 'reactions'>): Promise<ArticleComment> {
    const newComment: ArticleComment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reactions: [],
      createdAt: new Date(),
    };

    // Get current article
    const result = await this.dynamoClient.send(new QueryCommand({
      TableName: process.env.KB_ARTICLES_TABLE || 'prework-kb-articles',
      KeyConditionExpression: 'id = :articleId',
      ExpressionAttributeValues: marshall({
        ':articleId': articleId,
      }),
    }));

    if (result.Items && result.Items.length > 0) {
      const article = unmarshall(result.Items[0]) as KBArticle;
      const updatedComments = [...article.comments, newComment];

      await this.dynamoClient.send(new UpdateItemCommand({
        TableName: process.env.KB_ARTICLES_TABLE || 'prework-kb-articles',
        Key: marshall({ id: articleId }),
        UpdateExpression: 'SET comments = :comments',
        ExpressionAttributeValues: marshall({
          ':comments': updatedComments,
        }),
      }));
    }

    return newComment;
  }

  private async incrementKBArticleCount(knowledgeBaseId: string): Promise<void> {
    await this.dynamoClient.send(new UpdateItemCommand({
      TableName: process.env.KNOWLEDGE_BASE_TABLE || 'prework-knowledge-base',
      Key: marshall({ id: knowledgeBaseId }),
      UpdateExpression: 'ADD metadata.articleCount :inc',
      ExpressionAttributeValues: marshall({
        ':inc': 1,
      }),
    }));
  }

  // ==================== SEARCH FUNCTIONALITY ====================

  async searchContent(query: SearchQuery, workspaceId: string): Promise<SearchResults> {
    // Simplified search implementation
    // In production, would use Amazon OpenSearch or CloudSearch
    
    const startTime = Date.now();
    const results: any[] = [];

    // Search messages
    if (query.scope.type === 'all' || query.scope.type === 'messages') {
      const messageResults = await this.searchMessages(query, workspaceId);
      results.push(...messageResults);
    }

    // Search articles
    if (query.scope.type === 'all' || query.scope.type === 'articles') {
      const articleResults = await this.searchArticles(query, workspaceId);
      results.push(...articleResults);
    }

    const executionTime = Date.now() - startTime;

    return {
      query,
      total: results.length,
      results: results.slice(
        query.pagination.offset || 0,
        (query.pagination.offset || 0) + query.pagination.limit
      ),
      facets: [],
      suggestions: [],
      executionTime,
    };
  }

  private async searchMessages(query: SearchQuery, workspaceId: string): Promise<any[]> {
    // Basic text search in messages
    const result = await this.dynamoClient.send(new ScanCommand({
      TableName: process.env.MESSAGES_TABLE || 'prework-messages',
      FilterExpression: 'contains(content.#text, :query)',
      ExpressionAttributeNames: {
        '#text': 'text',
      },
      ExpressionAttributeValues: marshall({
        ':query': query.query,
      }),
    }));

    return result.Items?.map(item => {
      const message = unmarshall(item) as ChatMessage;
      return {
        id: message.id,
        type: 'message',
        title: `Message from ${message.authorId}`,
        snippet: message.content.text?.substring(0, 150) + '...',
        url: `/channels/${message.channelId}/messages/${message.id}`,
        score: 1.0,
        metadata: {
          author: message.authorId,
          channel: message.channelId,
          createdAt: message.createdAt,
        },
        highlights: [],
      };
    }) || [];
  }

  private async searchArticles(query: SearchQuery, workspaceId: string): Promise<any[]> {
    // Basic text search in articles
    const result = await this.dynamoClient.send(new ScanCommand({
      TableName: process.env.KB_ARTICLES_TABLE || 'prework-kb-articles',
      FilterExpression: 'contains(title, :query) OR contains(content.body, :query)',
      ExpressionAttributeValues: marshall({
        ':query': query.query,
      }),
    }));

    return result.Items?.map(item => {
      const article = unmarshall(item) as KBArticle;
      return {
        id: article.id,
        type: 'article',
        title: article.title,
        snippet: article.summary || article.content.body.substring(0, 150) + '...',
        url: `/kb/${article.knowledgeBaseId}/articles/${article.id}`,
        score: 1.0,
        metadata: {
          author: article.authorId,
          space: article.spaceId,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        },
        highlights: [],
      };
    }) || [];
  }

  // ==================== CALL RECORDINGS ====================

  async uploadCallRecording(callId: string, recording: Buffer, fileName: string): Promise<string> {
    const fileKey = `recordings/${callId}/${Date.now()}_${fileName}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.RECORDINGS_BUCKET || 'prework-recordings',
      Key: fileKey,
      Body: recording,
      ContentType: 'video/mp4',
    }));

    return fileKey;
  }

  async getRecordingUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.RECORDINGS_BUCKET || 'prework-recordings',
      Key: fileKey,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 7200 }); // 2 hours
  }
}

export default new CommunicationHubService();
