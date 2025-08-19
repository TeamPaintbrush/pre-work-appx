# 🗄️ Database Schema - Pre-Work App

## Overview
The application uses AWS DynamoDB for data storage with three main tables. All tables use UUID for primary keys and include audit timestamps.

---

## 👥 Users Table

**Table Name**: `prework-users`
**Primary Key**: `id` (String)

### Schema
```typescript
interface User {
  id: string;                    // UUID v4
  email: string;                 // Unique email address
  name: string;                  // Full name
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;             // Soft delete flag
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### Indexes
- **Email-Index**: Global Secondary Index on `email` field
- **Role-Index**: Global Secondary Index on `role` field for admin queries

### Example Record
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@company.com",
  "name": "John Doe",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 👤 User Profiles Table

**Table Name**: `prework-user-profiles`
**Primary Key**: `id` (String)

### Schema
```typescript
interface UserProfile {
  id: string;                    // UUID v4
  userId: string;                // Foreign key to Users table
  name: string;                  // Profile name
  type: 'personal' | 'professional' | 'custom';
  customFields: Record<string, any>; // Flexible JSON object
  isDefault: boolean;            // Default profile flag
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### Indexes
- **UserId-Index**: Global Secondary Index on `userId` field
- **UserId-Default-Index**: Composite index on `userId` and `isDefault`

### Example Record
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Work Profile",
  "type": "professional",
  "customFields": {
    "department": "Engineering",
    "jobTitle": "Senior Developer",
    "location": "New York",
    "manager": "Jane Smith",
    "skills": ["TypeScript", "React", "AWS"],
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  },
  "isDefault": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:22:00.000Z"
}
```

---

## 📋 Audit Logs Table

**Table Name**: `prework-audit-logs`
**Primary Key**: `id` (String)

### Schema
```typescript
interface AuditLog {
  id: string;                    // UUID v4
  userId: string;                // User who performed the action
  action: string;                // Action type (e.g., 'user.created')
  details: Record<string, any>;  // Action-specific details
  timestamp: string;             // ISO 8601 timestamp
  ipAddress?: string;            // Client IP address
  userAgent?: string;            // Client user agent
}
```

### Indexes
- **UserId-Timestamp-Index**: Global Secondary Index on `userId` and `timestamp`
- **Action-Timestamp-Index**: Global Secondary Index on `action` and `timestamp`
- **Timestamp-Index**: Global Secondary Index on `timestamp` for chronological queries

### Example Record
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "profile.updated",
  "details": {
    "profileId": "660e8400-e29b-41d4-a716-446655440001",
    "changes": {
      "customFields.department": {
        "from": "Sales",
        "to": "Engineering"
      }
    },
    "affectedFields": ["customFields"]
  },
  "timestamp": "2024-01-20T14:22:00.000Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

---

## 📁 S3 Media Storage

**Bucket Name**: `prework-media-bucket-[random-suffix]`
**Region**: `us-east-1` (configurable)

### File Structure
```
bucket-name/
├── users/
│   └── {userId}/
│       ├── profiles/
│       │   └── {profileId}/
│       │       ├── avatar.jpg
│       │       └── background.png
│       ├── uploads/
│       │   ├── {year}/
│       │   │   └── {month}/
│       │   │       ├── document.pdf
│       │   │       └── image.jpg
│       │   └── temp/
│       │       └── {fileId}.tmp
│       └── exports/
│           └── checklist-{date}.pdf
└── templates/
    └── shared/
        ├── {templateId}/
        │   ├── thumbnail.jpg
        │   └── template.json
        └── public/
            └── sample-template.json
```

### File Metadata
Each uploaded file has associated metadata stored in DynamoDB:

```typescript
interface FileMetadata {
  id: string;                    // UUID v4
  originalName: string;          // Original filename
  mimeType: string;              // MIME type
  size: number;                  // File size in bytes
  s3Key: string;                 // S3 object key
  uploadedBy: string;            // User ID who uploaded
  tags?: string[];               // Optional tags
  isPublic: boolean;             // Public access flag
  expiresAt?: string;            // Optional expiration
  createdAt: string;             // Upload timestamp
}
```

---

## 🔐 Security & Access Patterns

### Data Access Patterns

1. **User Management**
   - Get user by ID: Direct key lookup
   - Get user by email: Query Email-Index
   - List users by role: Query Role-Index

2. **Profile Management**
   - Get profiles for user: Query UserId-Index
   - Get default profile: Query UserId-Default-Index
   - Update profile: Direct key update with audit log

3. **Audit Queries**
   - User activity: Query UserId-Timestamp-Index
   - System events: Query Action-Timestamp-Index
   - Recent activity: Query Timestamp-Index with limit

### Data Consistency
- **Users**: Strong consistency for authentication operations
- **Profiles**: Eventually consistent for better performance
- **Audit Logs**: Eventually consistent (write-heavy workload)

### Backup Strategy
- **Point-in-time recovery**: Enabled on all tables
- **Continuous backups**: 35-day retention
- **On-demand backups**: Created before major updates

---

## 📊 Performance Considerations

### Read/Write Capacity
- **Users Table**: 5 RCU / 5 WCU (auto-scaling enabled)
- **Profiles Table**: 10 RCU / 5 WCU (read-heavy)
- **Audit Logs**: 5 RCU / 10 WCU (write-heavy)

### Query Optimization
- Use projection expressions to limit returned attributes
- Implement pagination for large result sets
- Cache frequently accessed user data
- Use batch operations for bulk updates

### Cost Optimization
- Enable DynamoDB auto-scaling
- Use S3 Intelligent Tiering for media files
- Implement lifecycle policies for audit logs
- Monitor unused indexes and remove if necessary
