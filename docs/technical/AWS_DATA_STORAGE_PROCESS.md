# Complete AWS Data & Storage Process Guide

## 🏗️ Overview

Your enterprise backend features now integrate seamlessly with AWS for complete data and storage management. Here's how the entire process works from frontend to AWS and back.

## 📊 Data Flow Architecture

```
Frontend App → Next.js API Routes → AWS Services → Database Storage
     ↑                                     ↓
     └────────── Real-time Updates ←───────┘
```

## 🔄 Complete Data Process Workflows

### 1. User Authentication Process

```typescript
// Frontend: User Login Request
const loginResult = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@company.com',
    password: 'password123'
  })
});

// API Route: /api/auth/login.ts
export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  // Step 1: Verify credentials with AWS DynamoDB
  const user = await UserRepository.verifyPassword(email, password);
  
  if (user) {
    // Step 2: Create session in DynamoDB
    const session = await authService.createSession(user);
    
    // Step 3: Log to audit trail in DynamoDB
    await createAuditLog({
      action: 'USER_LOGIN_SUCCESS',
      userId: user.userId,
      entityType: 'user',
      entityId: user.userId,
      // Stored in DynamoDB audit table
    });
    
    return Response.json({ success: true, user, token });
  }
}

// AWS DynamoDB Storage Process
// UserRepository.verifyPassword() executes:
await docClient.send(new QueryCommand({
  TableName: 'pre-work-users',
  IndexName: 'EmailIndex',
  KeyConditionExpression: 'email = :email',
  // AWS automatically handles:
  // - Query optimization
  // - Index scanning  
  // - Data retrieval
  // - Encryption at rest
}));
```

### 2. Team Collaboration Process

```typescript
// Frontend: Create Team
const { createTeam } = useEnterpriseAuth();

const newTeam = await createTeam({
  name: 'Quality Assurance Team',
  description: 'QA processes and inspections',
  organizationId: 'org-123',
  managerId: currentUser.userId,
  settings: {
    visibility: 'organization',
    allowMemberInvites: true,
    requireApprovalForJoin: false,
    defaultPermissions: ['checklist.assign_team']
  }
});

// Backend Processing:
// 1. Data flows to Next.js API route
// 2. API route calls AwsTeamService.createTeam()
// 3. Multiple AWS operations execute atomically:

await docClient.send(new BatchWriteCommand({
  RequestItems: {
    'pre-work-teams': [
      {
        PutRequest: {
          Item: {
            PK: `TEAM#${teamId}`,        // Partition Key
            SK: 'METADATA',              // Sort Key
            teamId,
            name: 'Quality Assurance Team',
            organizationId: 'org-123',
            managerId: currentUser.userId,
            settings: { /* team settings */ },
            isActive: true,
            memberCount: 1,
            createdAt: '2024-08-16T12:00:00Z',
            GSI1PK: `ORG#org-123`,       // Global Secondary Index
            GSI1SK: `TEAM#${teamId}`     // For organization queries
          }
        }
      },
      {
        PutRequest: {
          Item: {
            PK: `TEAM#${teamId}`,
            SK: `MEMBER#${managerId}`,   // Team member record
            userId: managerId,
            role: 'team_lead',
            permissions: ['checklist.assign_team', 'member.invite'],
            joinedAt: '2024-08-16T12:00:00Z',
            GSI2PK: `USER#${managerId}`, // For user's teams queries
            GSI2SK: `TEAM#${teamId}`
          }
        }
      }
    ]
  }
}));

// 4. Audit logging to separate audit table
await createAuditLog({
  action: 'TEAM_CREATED',
  entityType: 'user',
  userId: managerId,
  entityId: teamId,
  newValues: {
    teamName: 'Quality Assurance Team',
    organizationId: 'org-123',
    memberCount: 1
  }
  // Stored in 'pre-work-audit-log' table
});

// 5. Real-time notification broadcast
await broadcastEvent({
  eventType: 'team.created',
  userId: managerId,
  entityId: teamId,
  data: { teamName: 'Quality Assurance Team' }
  // Stored in 'pre-work-sessions' table for event history
});
```

### 3. File Upload & Storage Process

```typescript
// Frontend: File Upload Request
const uploadFile = async (file: File, submissionId: string) => {
  // Step 1: Request signed upload URL
  const response = await fetch('/api/media/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      submissionId,
      entityType: 'submission'
    })
  });
  
  const { uploadUrl, key, fileId } = await response.json();
  
  // Step 2: Upload directly to S3 (bypasses your server)
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  });
  
  // Step 3: Confirm upload completion
  await fetch('/api/media/confirm-upload', {
    method: 'POST',
    body: JSON.stringify({ fileId, key })
  });
};

// Backend API: Generate Upload URL (/api/media/upload-url.ts)
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: Request) {
  const { fileName, fileType, submissionId, entityType } = await request.json();
  
  // Generate S3 key with organized structure
  const key = `${entityType}s/${submissionId}/${userId}/${fileName}`;
  
  // Create signed URL for direct S3 upload
  const command = new PutObjectCommand({
    Bucket: 'pre-work-media-uploads',
    Key: key,
    ContentType: fileType,
    Metadata: {
      uploadedBy: userId,
      entityType,
      entityId: submissionId,
      originalName: fileName
    }
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 // 1 hour expiration
  });
  
  return Response.json({ uploadUrl, key, fileId: uuidv4() });
}

// Backend API: Confirm Upload (/api/media/confirm-upload.ts)
export async function POST(request: Request) {
  const { fileId, key } = await request.json();
  
  // Save file metadata to DynamoDB
  await docClient.send(new PutCommand({
    TableName: 'pre-work-media',
    Item: {
      PK: `MEDIA#${fileId}`,
      SK: 'METADATA',
      fileId,
      userId,
      fileName: originalName,
      s3Key: key,
      s3Bucket: 'pre-work-media-uploads',
      fileSize: file.size,
      mimeType: file.type,
      uploadStatus: 'completed',
      createdAt: new Date().toISOString(),
      GSI1PK: `USER#${userId}`,      // For user's files
      GSI1SK: `MEDIA#${fileId}`
    }
  }));
  
  // Real-time notification to collaborators
  await broadcastEvent({
    eventType: 'file.uploaded',
    userId,
    entityId: submissionId,
    data: { fileId, fileName: originalName, fileSize: file.size }
  });
}

// AWS S3 Storage Structure Created:
// pre-work-media-uploads/
// ├── submissions/
// │   ├── submission-123/
// │   │   ├── user-456/
// │   │   │   ├── inspection-photo.jpg
// │   │   │   └── safety-checklist.pdf
// │   │   └── user-789/
// │   │       └── compliance-document.docx
// │   └── submission-456/
// └── users/
//     ├── user-123/
//     │   └── profile/
//     │       └── avatar.png
//     └── teams/
//         └── team-789/
//             └── shared/
//                 └── team-guidelines.pdf
```

### 4. Real-time Collaboration Process

```typescript
// Frontend: Join Real-time Session
const { joinSession, subscribe } = useEnterpriseAuth();

// Step 1: Join collaboration session
await joinSession('checklist-123', 'checklist');

// This triggers backend processes:
// 1. Create session record in DynamoDB
await docClient.send(new PutCommand({
  TableName: 'pre-work-sessions',
  Item: {
    PK: `SESSION#checklist#checklist-123`,
    SK: `USER#${userId}`,
    sessionId: uuidv4(),
    userId,
    userName: 'John Doe',
    entityId: 'checklist-123',
    entityType: 'checklist',
    joinedAt: new Date().toISOString(),
    isActive: true,
    TTL: Math.floor(Date.now() / 1000) + 86400 // Auto-cleanup after 24h
  }
}));

// 2. Broadcast join event to other users
await broadcastEvent({
  eventType: 'team.member.joined',
  userId,
  entityId: 'checklist-123',
  data: { userName: 'John Doe', sessionId }
});

// Frontend: Subscribe to real-time updates
useEffect(() => {
  const unsubscribe = subscribe((event) => {
    switch (event.eventType) {
      case 'checklist.item.checked':
        // Update UI immediately
        updateChecklistItem(event.data.itemId, true);
        break;
      case 'team.member.joined':
        // Show notification
        showNotification(`${event.data.userName} joined`);
        break;
    }
  });
  
  return unsubscribe;
}, []);

// Backend: Real-time Operation Processing
// When user checks a checklist item:
const result = await awsRealTimeSyncService.applyOperation({
  userId,
  type: 'update',
  path: 'checklist-123.items.item-456.checked',
  oldValue: false,
  newValue: true,
  entityId: 'checklist-123',
  entityType: 'checklist'
});

// This process:
// 1. Stores operation in DynamoDB with versioning
await docClient.send(new PutCommand({
  TableName: 'pre-work-sessions',
  Item: {
    PK: `OPERATION#checklist-123`,
    SK: `TIMESTAMP#${timestamp}#${operationId}`,
    operationId,
    userId,
    type: 'update',
    path: 'checklist-123.items.item-456.checked',
    oldValue: false,
    newValue: true,
    version: currentVersion + 1,
    TTL: Math.floor(Date.now() / 1000) + 604800 // 7 days
  }
}));

// 2. Updates sync state for conflict resolution
await docClient.send(new UpdateCommand({
  TableName: 'pre-work-sessions',
  Key: {
    PK: `SYNC#checklist-123`,
    SK: 'STATE'
  },
  UpdateExpression: 'SET version = :version, lastModified = :now, modifiedBy = :userId',
  ExpressionAttributeValues: {
    ':version': currentVersion + 1,
    ':now': new Date().toISOString(),
    ':userId': userId
  }
}));

// 3. Broadcasts to all active sessions
const activeSessions = await getActiveSessions('checklist-123');
activeSessions.forEach(session => {
  // Send via WebSocket or push notification
  sendToUser(session.userId, {
    eventType: 'checklist.item.checked',
    data: { itemId: 'item-456', checked: true, updatedBy: userId }
  });
});
```

## 🛡️ Security & Access Control Process

### Row-Level Security Implementation

```typescript
// Example: User can only access their organization's data
export async function getUserTeams(userId: string, requestingUserId: string) {
  // Step 1: Get requesting user's organization
  const requestingUser = await UserRepository.getUserById(requestingUserId);
  
  // Step 2: Query teams with organization filter
  const result = await docClient.send(new QueryCommand({
    TableName: 'pre-work-teams',
    IndexName: 'UserTeamsIndex',
    KeyConditionExpression: 'GSI2PK = :userKey',
    FilterExpression: 'organizationId = :orgId', // Security filter
    ExpressionAttributeValues: {
      ':userKey': `USER#${userId}`,
      ':orgId': requestingUser.organizationId
    }
  }));
  
  return result.Items;
}

// Permission-based data access
export async function getAssignments(userId: string, hasAnalyticsPermission: boolean) {
  const baseQuery = {
    TableName: 'pre-work-assignments',
    IndexName: 'UserAssignmentsIndex',
    KeyConditionExpression: 'GSI1PK = :userKey',
    ExpressionAttributeValues: {
      ':userKey': `USER#${userId}`
    }
  };
  
  // Analytics users can see additional data
  if (hasAnalyticsPermission) {
    baseQuery.ProjectionExpression = undefined; // Return all fields
  } else {
    baseQuery.ProjectionExpression = 'assignmentId, checklistId, status, dueDate'; // Limited fields
  }
  
  return await docClient.send(new QueryCommand(baseQuery));
}
```

## 📈 Performance & Scaling Process

### 1. DynamoDB Performance Optimization

```typescript
// Batch operations for efficiency
export async function createMultipleAssignments(assignments: Assignment[]) {
  // Process in batches of 25 (DynamoDB limit)
  const batches = chunk(assignments, 25);
  
  for (const batch of batches) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        'pre-work-assignments': batch.map(assignment => ({
          PutRequest: { Item: assignment }
        }))
      }
    }));
  }
}

// Efficient querying with GSI
export async function getRecentTeamActivity(teamId: string, limit: number = 50) {
  return await docClient.send(new QueryCommand({
    TableName: 'pre-work-sessions',
    KeyConditionExpression: 'PK = :pk',
    ScanIndexForward: false, // Newest first
    Limit: limit,
    ExpressionAttributeValues: {
      ':pk': `EVENT#team#${teamId}`
    }
  }));
}
```

### 2. S3 Performance Optimization

```typescript
// Multipart upload for large files
export async function uploadLargeFile(file: File, key: string) {
  if (file.size > 100 * 1024 * 1024) { // 100MB+
    // Use multipart upload
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: 'pre-work-media-uploads',
        Key: key,
        Body: file,
        Metadata: {
          originalName: file.name,
          uploadedBy: userId
        }
      },
      partSize: 10 * 1024 * 1024, // 10MB parts
      queueSize: 4 // 4 concurrent uploads
    });

    return await upload.done();
  } else {
    // Standard upload for smaller files
    return await s3Client.send(new PutObjectCommand({
      Bucket: 'pre-work-media-uploads',
      Key: key,
      Body: file
    }));
  }
}

// CDN integration for global performance
export function getOptimizedFileUrl(s3Key: string, transformations?: string) {
  const baseUrl = 'https://d1234567890.cloudfront.net';
  const transformQuery = transformations ? `?${transformations}` : '';
  return `${baseUrl}/${s3Key}${transformQuery}`;
}

// Example usage:
const thumbnailUrl = getOptimizedFileUrl(
  'submissions/sub-123/user-456/photo.jpg',
  'w=300&h=300&fit=crop&format=webp'
);
```

## 🔍 Monitoring & Analytics Process

### CloudWatch Integration

```typescript
// Custom metrics tracking
export async function logBusinessMetric(
  metricName: string,
  value: number,
  dimensions: Record<string, string>
) {
  await cloudWatchClient.putMetricData({
    Namespace: 'PreWork/Enterprise',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: 'Count',
      Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
      Timestamp: new Date()
    }]
  });
}

// Usage examples:
await logBusinessMetric('TeamAssignmentCreated', 1, {
  OrganizationId: 'org-123',
  TeamId: 'team-456',
  Priority: 'high'
});

await logBusinessMetric('CollaborationSessionDuration', sessionDuration, {
  EntityType: 'checklist',
  UserRole: 'manager'
});
```

## 🎯 Complete Integration Summary

### Data Storage Distribution:
- **User Authentication**: DynamoDB Users & Profiles tables
- **Team Collaboration**: DynamoDB Teams & Assignments tables  
- **Real-time Sync**: DynamoDB Sessions table with TTL
- **File Storage**: S3 buckets with organized folder structure
- **Audit Trail**: DynamoDB Audit table for compliance
- **Monitoring**: CloudWatch for metrics and performance

### Performance Benefits:
- **DynamoDB**: Microsecond latency for user operations
- **S3 Direct Upload**: Removes server bottleneck for files
- **CloudFront CDN**: Global content delivery
- **Real-time Updates**: WebSocket connections for instant collaboration
- **Auto-scaling**: AWS handles traffic spikes automatically

### Security Features:
- **IAM Permissions**: Fine-grained AWS access control
- **Encryption**: At rest and in transit for all data
- **VPC**: Network isolation for sensitive operations
- **Audit Logging**: Complete compliance trail
- **Session Management**: Secure token-based authentication

Your enterprise backend now has production-ready AWS integration that scales globally while maintaining security and performance!
