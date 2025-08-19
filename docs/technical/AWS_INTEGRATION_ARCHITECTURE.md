# AWS Integration Architecture for Enterprise Backend Features

## Overview

This document explains how your enterprise backend features integrate with AWS services for data storage, user management, and real-time capabilities. The architecture uses AWS best practices for scalability, security, and performance.

## 🏗️ AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud Infrastructure                  │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)                                            │
│  ├── React Components                                          │
│  ├── Enterprise Hooks                                          │
│  └── Authentication Provider                                   │
├─────────────────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes)                               │
│  ├── Authentication APIs                                       │
│  ├── Team Management APIs                                      │
│  ├── Real-time WebSocket APIs                                  │
│  └── File Upload APIs                                          │
├─────────────────────────────────────────────────────────────────┤
│  AWS Services Integration                                      │
│  ├── DynamoDB (Data Storage)                                  │
│  ├── S3 (File Storage)                                        │
│  ├── Cognito (Optional Enhanced Auth)                         │
│  ├── CloudFront (CDN)                                         │
│  ├── CloudWatch (Monitoring)                                  │
│  └── API Gateway (WebSocket for Real-time)                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🗄️ DynamoDB Data Storage Strategy

### Table Structure for Enterprise Features

#### 1. Users Table (`pre-work-users`)
```typescript
{
  PK: "USER#${userId}",           // Partition Key
  SK: "PROFILE",                  // Sort Key
  
  // User Data
  userId: string,
  email: string,
  username: string,
  role: UserRole,
  isActive: boolean,
  
  // Enterprise Fields
  organizationId?: string,
  managerId?: string,
  teamMembers: string[],
  permissions: Permission[],
  
  // Authentication
  passwordHash: string,
  lastLoginAt?: string,
  authProvider: 'cognito' | 'local' | 'sso',
  cognitoId?: string,
  
  // Audit
  createdAt: string,
  updatedAt: string
}
```

#### 2. Teams Table (`pre-work-teams`)
```typescript
{
  PK: "TEAM#${teamId}",          // Partition Key
  SK: "METADATA",                // Sort Key
  
  teamId: string,
  name: string,
  description?: string,
  organizationId: string,
  managerId: string,
  
  settings: {
    visibility: 'public' | 'private' | 'organization',
    allowMemberInvites: boolean,
    requireApprovalForJoin: boolean,
    defaultPermissions: TeamPermission[]
  },
  
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}

// Team Members (separate items)
{
  PK: "TEAM#${teamId}",
  SK: "MEMBER#${userId}",
  
  userId: string,
  role: TeamRole,
  permissions: TeamPermission[],
  joinedAt: string,
  isActive: boolean
}
```

#### 3. Assignments Table (`pre-work-assignments`)
```typescript
{
  PK: "ASSIGNMENT#${assignmentId}", // Partition Key
  SK: "METADATA",                   // Sort Key
  
  assignmentId: string,
  checklistId: string,
  teamId?: string,
  assignedTo: string[],
  assignedBy: string,
  
  dueDate?: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue',
  notes?: string,
  
  createdAt: string,
  updatedAt: string
}

// Assignment Status Updates
{
  PK: "ASSIGNMENT#${assignmentId}",
  SK: "STATUS#${timestamp}",
  
  status: string,
  updatedBy: string,
  notes?: string,
  timestamp: string
}
```

#### 4. Audit Log Table (`pre-work-audit-log`)
```typescript
{
  PK: "AUDIT#${date}",             // Partition by date for efficient querying
  SK: "LOG#${timestamp}#${logId}", // Sort by timestamp
  
  logId: string,
  userId: string,
  action: string,
  entityType: 'user' | 'profile' | 'submission' | 'media' | 'team' | 'assignment',
  entityId: string,
  
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  
  ipAddress?: string,
  userAgent?: string,
  timestamp: string
}
```

#### 5. Real-time Sessions Table (`pre-work-sessions`)
```typescript
{
  PK: "SESSION#${entityType}#${entityId}", // Group by entity
  SK: "USER#${userId}",                    // Sort by user
  
  sessionId: string,
  userId: string,
  userName: string,
  entityId: string,
  entityType: string,
  
  joinedAt: string,
  lastActivity: string,
  isActive: boolean,
  
  cursor?: {
    x: number,
    y: number,
    elementId?: string
  },
  
  TTL: number // Auto-cleanup expired sessions
}
```

### DynamoDB Access Patterns

#### Authentication Queries
```typescript
// Get user by email
const getUserByEmail = async (email: string) => {
  return await docClient.query({
    TableName: TABLES.USERS,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: { ':email': email }
  });
};

// Get user permissions
const getUserPermissions = async (userId: string) => {
  return await docClient.get({
    TableName: TABLES.USERS,
    Key: { PK: `USER#${userId}`, SK: 'PROFILE' }
  });
};
```

#### Team Management Queries
```typescript
// Get team members
const getTeamMembers = async (teamId: string) => {
  return await docClient.query({
    TableName: TABLES.TEAMS,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `TEAM#${teamId}`,
      ':sk': 'MEMBER#'
    }
  });
};

// Get user's teams
const getUserTeams = async (userId: string) => {
  return await docClient.query({
    TableName: TABLES.TEAMS,
    IndexName: 'UserTeamsIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  });
};
```

#### Assignment Queries
```typescript
// Get user assignments
const getUserAssignments = async (userId: string) => {
  return await docClient.query({
    TableName: TABLES.ASSIGNMENTS,
    IndexName: 'UserAssignmentsIndex',
    KeyConditionExpression: 'assignedTo = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  });
};

// Get team assignments
const getTeamAssignments = async (teamId: string) => {
  return await docClient.query({
    TableName: TABLES.ASSIGNMENTS,
    IndexName: 'TeamAssignmentsIndex',
    KeyConditionExpression: 'teamId = :teamId',
    ExpressionAttributeValues: { ':teamId': teamId }
  });
};
```

## 📁 S3 File Storage Strategy

### Bucket Structure
```
S3 Buckets:
├── pre-work-media-uploads/
│   ├── users/{userId}/profile/
│   ├── submissions/{submissionId}/
│   ├── teams/{teamId}/shared/
│   └── temp/{uploadId}/          # Temporary uploads
├── pre-work-thumbnails/
│   ├── users/{userId}/
│   └── submissions/{submissionId}/
└── pre-work-documents/
    ├── templates/{templateId}/
    ├── exports/{exportId}/
    └── reports/{reportId}/
```

### File Upload Process
```typescript
// 1. Generate signed URL for direct upload
export async function generateUploadUrl(
  fileName: string,
  fileType: string,
  userId: string,
  entityType: 'profile' | 'submission' | 'team',
  entityId: string
) {
  const key = `${entityType}s/${entityId}/${userId}/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKETS.MEDIA,
    Key: key,
    ContentType: fileType,
    Metadata: {
      uploadedBy: userId,
      entityType,
      entityId,
      originalName: fileName
    }
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return {
    uploadUrl,
    key,
    fileId: uuidv4()
  };
}

// 2. Save file metadata to DynamoDB
export async function saveFileMetadata(fileData: {
  fileId: string;
  userId: string;
  fileName: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
}) {
  await docClient.put({
    TableName: TABLES.MEDIA,
    Item: {
      PK: `MEDIA#${fileData.fileId}`,
      SK: 'METADATA',
      ...fileData,
      uploadStatus: 'completed',
      createdAt: new Date().toISOString()
    }
  });
}
```

## ⚡ Real-time Features with AWS

### WebSocket API Gateway Integration
```typescript
// WebSocket connection management
export class RealTimeManager {
  private wsEndpoint: string;
  private connectionId?: string;
  
  async connect(userId: string, entityId: string, entityType: string) {
    // Connect to API Gateway WebSocket
    this.wsEndpoint = process.env.WEBSOCKET_API_ENDPOINT!;
    
    const ws = new WebSocket(`${this.wsEndpoint}?userId=${userId}&entityId=${entityId}&entityType=${entityType}`);
    
    ws.onopen = () => {
      this.connectionId = this.extractConnectionId(ws);
      this.saveConnection(userId, entityId, entityType);
    };
    
    ws.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };
  }
  
  private async saveConnection(userId: string, entityId: string, entityType: string) {
    await docClient.put({
      TableName: TABLES.SESSIONS,
      Item: {
        PK: `SESSION#${entityType}#${entityId}`,
        SK: `USER#${userId}`,
        connectionId: this.connectionId,
        userId,
        entityId,
        entityType,
        joinedAt: new Date().toISOString(),
        isActive: true,
        TTL: Math.floor(Date.now() / 1000) + 86400 // 24 hours
      }
    });
  }
}
```

### Broadcasting Real-time Events
```typescript
// API Gateway WebSocket broadcast
export async function broadcastToRoom(
  entityType: string,
  entityId: string,
  event: RealTimeEvent,
  excludeUserId?: string
) {
  // Get all active connections for the room
  const connections = await docClient.query({
    TableName: TABLES.SESSIONS,
    KeyConditionExpression: 'PK = :pk',
    FilterExpression: 'isActive = :active',
    ExpressionAttributeValues: {
      ':pk': `SESSION#${entityType}#${entityId}`,
      ':active': true
    }
  });
  
  // Send event to each connection
  const promises = connections.Items?.map(async (connection) => {
    if (excludeUserId && connection.userId === excludeUserId) return;
    
    try {
      await apiGatewayManagementApi.postToConnection({
        ConnectionId: connection.connectionId,
        Data: JSON.stringify(event)
      }).promise();
    } catch (error) {
      // Clean up stale connections
      if (error.statusCode === 410) {
        await cleanupConnection(connection.connectionId);
      }
    }
  });
  
  await Promise.all(promises || []);
}
```

## 🔄 Data Flow Examples

### 1. User Authentication Flow
```typescript
// 1. User login request
POST /api/auth/login
{
  "email": "user@company.com",
  "password": "password123",
  "organizationCode": "ACME"
}

// 2. Validate credentials against DynamoDB
const user = await docClient.get({
  TableName: TABLES.USERS,
  Key: { PK: `USER#${userId}`, SK: 'PROFILE' }
});

// 3. Create session and audit log
await Promise.all([
  createSession(user),
  createAuditLog({
    action: 'USER_LOGIN_SUCCESS',
    userId: user.userId,
    // ... audit data
  })
]);

// 4. Return session token
return { success: true, token, user };
```

### 2. Team Assignment Flow
```typescript
// 1. Create assignment
const assignment = await docClient.put({
  TableName: TABLES.ASSIGNMENTS,
  Item: {
    PK: `ASSIGNMENT#${assignmentId}`,
    SK: 'METADATA',
    // ... assignment data
  }
});

// 2. Notify team members via real-time
await broadcastToRoom('team', teamId, {
  eventType: 'assignment.created',
  data: assignment
});

// 3. Send notifications (optional)
await sendEmailNotifications(assignedUsers, assignment);

// 4. Log audit trail
await createAuditLog({
  action: 'ASSIGNMENT_CREATED',
  userId: assignedBy,
  entityId: assignmentId,
  // ... audit data
});
```

### 3. File Upload Flow
```typescript
// 1. Request upload URL
const { uploadUrl, key, fileId } = await generateUploadUrl(
  fileName, fileType, userId, 'submission', submissionId
);

// 2. Frontend uploads directly to S3
fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': fileType }
});

// 3. Confirm upload and save metadata
await saveFileMetadata({
  fileId,
  userId,
  fileName,
  s3Key: key,
  fileSize: file.size,
  mimeType: fileType
});

// 4. Broadcast file upload event
await broadcastToRoom('submission', submissionId, {
  eventType: 'file.uploaded',
  data: { fileId, fileName }
});
```

## 🛡️ Security Implementation

### 1. Authentication Security
```typescript
// Password hashing with bcrypt
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// JWT token management
import jwt from 'jsonwebtoken';

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      userId: user.userId,
      role: user.role,
      permissions: user.permissions,
      organizationId: user.organizationId
    },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
}
```

### 2. DynamoDB Security
```typescript
// Row-level security with conditions
export async function updateUserData(userId: string, updates: any, requestingUserId: string) {
  // Ensure users can only update their own data (unless admin)
  const condition = userId === requestingUserId 
    ? undefined 
    : 'attribute_exists(PK) AND #role IN (:admin, :superAdmin)';
    
  await docClient.update({
    TableName: TABLES.USERS,
    Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
    UpdateExpression: 'SET #data = :data, updatedAt = :now',
    ConditionExpression: condition,
    ExpressionAttributeNames: {
      '#data': 'data',
      '#role': 'role'
    },
    ExpressionAttributeValues: {
      ':data': updates,
      ':now': new Date().toISOString(),
      ':admin': 'administrator',
      ':superAdmin': 'super_admin'
    }
  });
}
```

### 3. S3 Security
```typescript
// Pre-signed URLs with time limits and conditions
export async function generateSecureUploadUrl(
  fileName: string,
  userId: string,
  maxFileSize: number = 10 * 1024 * 1024 // 10MB
) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKETS.MEDIA,
    Key: `users/${userId}/${fileName}`,
    ContentType: 'application/octet-stream',
    Metadata: {
      uploadedBy: userId,
      uploadTime: new Date().toISOString()
    }
  });
  
  return await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
    signableHeaders: new Set(['content-length']),
    conditions: [
      ['content-length-range', 0, maxFileSize]
    ]
  });
}
```

## 📊 Monitoring and Analytics

### 1. CloudWatch Integration
```typescript
// Custom metrics for enterprise features
export async function logCustomMetric(
  metricName: string,
  value: number,
  unit: string = 'Count',
  dimensions: Record<string, string> = {}
) {
  const params = {
    Namespace: 'PreWork/Enterprise',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
      Timestamp: new Date()
    }]
  };
  
  await cloudWatchClient.putMetricData(params);
}

// Example usage
await logCustomMetric('UserLogins', 1, 'Count', {
  OrganizationId: user.organizationId,
  UserRole: user.role
});

await logCustomMetric('TeamAssignments', 1, 'Count', {
  TeamId: teamId,
  Priority: assignment.priority
});
```

### 2. Performance Monitoring
```typescript
// DynamoDB performance tracking
export async function executeWithMetrics<T>(
  operation: () => Promise<T>,
  operationType: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    // Log successful operation
    await logCustomMetric('DatabaseOperationDuration', Date.now() - startTime, 'Milliseconds', {
      Operation: operationType,
      Status: 'Success'
    });
    
    return result;
  } catch (error) {
    // Log failed operation
    await logCustomMetric('DatabaseOperationErrors', 1, 'Count', {
      Operation: operationType,
      ErrorType: error.name
    });
    
    throw error;
  }
}
```

## 🚀 Scaling Considerations

### 1. DynamoDB Scaling
- **On-Demand Billing**: Automatically scales with traffic
- **GSI Strategy**: Create indexes for common query patterns
- **Hot Partition Avoidance**: Use composite keys to distribute load
- **Caching**: Implement ElastiCache for frequently accessed data

### 2. S3 Optimization
- **CloudFront CDN**: Global content delivery
- **Intelligent Tiering**: Automatic cost optimization
- **Multipart Uploads**: Efficient large file handling
- **Transfer Acceleration**: Faster global uploads

### 3. Real-time Scaling
- **API Gateway Limits**: Monitor connection limits
- **Lambda Concurrency**: Scale WebSocket handlers
- **DynamoDB Streams**: Process real-time updates
- **EventBridge**: Decouple event processing

This architecture provides a robust, scalable foundation for your enterprise backend features with AWS integration. The next step would be implementing the actual AWS repository classes to replace the mock implementations.
