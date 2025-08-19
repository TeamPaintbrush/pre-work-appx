# AWS Template Storage Implementation

## Overview

This implementation provides comprehensive AWS cloud storage for template cards/modules data using DynamoDB and S3. All template data is securely stored, versioned, and managed through AWS infrastructure.

## Architecture

### AWS Services Used

1. **Amazon DynamoDB**
   - Primary storage for template metadata and structure
   - Global Secondary Indexes for efficient querying
   - Automatic scaling and encryption at rest
   - DynamoDB Streams for real-time data changes

2. **Amazon S3**
   - Template file storage and backups
   - Versioning enabled for data protection
   - Server-side encryption (AES-256)
   - CORS configuration for web access

### Data Structure

#### DynamoDB Table Schema
```
Primary Key: PK (Partition Key), SK (Sort Key)
GSI1: GSI1PK, GSI1SK (Workspace-based queries)
GSI2: GSI2PK, GSI2SK (User-based queries)

Item Structure:
- PK: "TEMPLATE#{templateId}"
- SK: "WORKSPACE#{workspaceId}"
- GSI1PK: "WORKSPACE#{workspaceId}"
- GSI1SK: "TEMPLATE#{timestamp}"
- GSI2PK: "USER#{userId}"
- GSI2SK: "TEMPLATE#{timestamp}"
- ... template data fields
```

#### S3 Object Structure
```
Bucket: prework-templates-storage
Key Pattern: templates/{workspaceId}/{templateId}/template.json
Metadata: templateId, workspaceId, userId, version
```

## Implementation Files

### Core Services

1. **`src/services/aws/TemplateStorageService.ts`**
   - Primary AWS storage service
   - CRUD operations for templates
   - Search and filtering capabilities
   - Health monitoring

2. **`src/services/aws/TemplateMigrationService.ts`**
   - Migration utilities for existing templates
   - Batch processing and verification
   - Rollback capabilities

3. **`src/hooks/useAWSTemplates.ts`**
   - React hook for AWS template management
   - State management and error handling
   - Real-time updates

4. **`src/components/AWS/AWSTemplateDashboard.tsx`**
   - Admin dashboard for AWS template management
   - Migration interface
   - Health monitoring and analytics

### Configuration

5. **`.env.aws.example`**
   - Environment variables template
   - AWS credentials and configuration

6. **`scripts/setup-aws-template-storage.js`**
   - Automated AWS resource creation
   - DynamoDB table and S3 bucket setup
   - Configuration validation

## Setup Instructions

### 1. AWS Account Setup

1. Create an AWS account if you don't have one
2. Create an IAM user with programmatic access
3. Attach the following AWS managed policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - Or create custom policies with minimal permissions

### 2. Environment Configuration

1. Copy `.env.aws.example` to `.env.local`
2. Fill in your AWS credentials:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_DYNAMODB_TEMPLATES_TABLE=prework-templates
   AWS_S3_TEMPLATES_BUCKET=prework-templates-storage
   ```

### 3. AWS Resources Setup

Run the setup script to create necessary AWS resources:

```bash
node scripts/setup-aws-template-storage.js
```

This will create:
- DynamoDB table with proper indexes and encryption
- S3 bucket with versioning and encryption
- CORS configuration for web access

### 4. Template Migration

Use the AWS Template Dashboard to migrate existing templates:

1. Navigate to `/templates` in your app
2. Click "AWS Storage" button
3. Go to "Migration" tab
4. Click "Start Migration"
5. Verify migration completion

## Features

### Template Management

- **Create**: Save new templates to AWS with metadata
- **Read**: Retrieve templates with efficient querying
- **Update**: Version-controlled template updates
- **Delete**: Secure template deletion from both DynamoDB and S3

### Advanced Capabilities

- **Search & Filter**: Multi-criteria template search
- **Batch Operations**: Bulk template operations
- **Analytics**: Usage tracking and performance metrics
- **Health Monitoring**: AWS service health checks
- **Migration Tools**: Automated data migration

### Security Features

- **Encryption**: Data encrypted at rest and in transit
- **Access Control**: Workspace and user-based access
- **Versioning**: Complete audit trail of changes
- **Backup**: Automatic S3 backups of all templates

## Usage Examples

### Basic Template Operations

```typescript
import { useAWSTemplates } from '../hooks/useAWSTemplates';

function MyComponent() {
  const {
    templates,
    loading,
    saveTemplate,
    updateTemplate,
    deleteTemplate
  } = useAWSTemplates({
    workspaceId: 'workspace-123',
    userId: 'user-456'
  });

  // Save a new template
  const handleSave = async (template) => {
    const result = await saveTemplate(template, {
      makePublic: false,
      generateThumbnail: true
    });
  };

  // Update existing template
  const handleUpdate = async (templateId, updates) => {
    const result = await updateTemplate(templateId, updates);
  };

  // Delete template
  const handleDelete = async (templateId) => {
    const success = await deleteTemplate(templateId);
  };
}
```

### Advanced Search

```typescript
const searchResults = await searchTemplates({
  category: 'cleaning',
  tags: ['safety', 'maintenance'],
  difficulty: 'medium',
  isPublic: true,
  sortBy: 'rating',
  sortOrder: 'desc',
  limit: 20
});
```

### Migration

```typescript
const migrationResult = await migrateTemplates();
console.log(`Migrated ${migrationResult.migratedTemplates}/${migrationResult.totalTemplates} templates`);
```

## Cost Optimization

### DynamoDB

- **Pay-per-request billing**: Only pay for actual usage
- **Automatic scaling**: Handles traffic spikes efficiently
- **Reserved capacity**: For predictable workloads (optional)

### S3

- **Intelligent Tiering**: Automatic cost optimization
- **Lifecycle policies**: Archive old template versions
- **Compression**: JSON templates are automatically compressed

### Estimated Costs

For 1000 templates with moderate usage:
- DynamoDB: ~$5-10/month
- S3: ~$1-3/month
- Total: ~$6-13/month

## Monitoring & Troubleshooting

### Health Checks

The system includes built-in health monitoring:

```typescript
const health = await healthCheck();
console.log(health); // { dynamodb: true, s3: true }
```

### Error Handling

All operations include comprehensive error handling:
- Network connectivity issues
- AWS service errors
- Data validation errors
- Permission issues

### Logging

Enable detailed logging in development:
```env
AWS_SDK_LOG_LEVEL=debug
```

## Security Best Practices

1. **IAM Permissions**: Use minimal required permissions
2. **Encryption**: Enable encryption for all data
3. **Network Security**: Use VPC endpoints for private access
4. **Audit Logging**: Enable CloudTrail for API calls
5. **Access Patterns**: Monitor unusual access patterns

## Performance Optimization

1. **Efficient Queries**: Use GSIs for complex queries
2. **Batch Operations**: Group multiple operations
3. **Caching**: Implement application-level caching
4. **Connection Pooling**: Reuse AWS SDK connections

## Disaster Recovery

1. **Point-in-time Recovery**: Enabled on DynamoDB
2. **Cross-region Replication**: Configure S3 replication
3. **Backup Strategy**: Automated backups and versioning
4. **Recovery Testing**: Regular disaster recovery drills

## Future Enhancements

1. **Real-time Sync**: WebSocket-based real-time updates
2. **Full-text Search**: Elasticsearch integration
3. **Analytics Dashboard**: Advanced usage analytics
4. **Template Marketplace**: Public template sharing
5. **AI Integration**: Smart template recommendations

## Support

For issues or questions:
1. Check AWS service health status
2. Review CloudWatch logs and metrics
3. Verify IAM permissions
4. Test with AWS CLI commands
5. Contact support with detailed error logs

## API Reference

### TemplateStorageService

```typescript
class TemplateStorageService {
  async saveTemplate(template, workspaceId, userId, options): Promise<StoredTemplate>
  async getTemplate(templateId, workspaceId): Promise<StoredTemplate | null>
  async searchTemplates(options): Promise<StoredTemplate[]>
  async updateTemplate(templateId, workspaceId, updates, userId): Promise<StoredTemplate>
  async deleteTemplate(templateId, workspaceId): Promise<void>
  async batchSaveTemplates(templates, workspaceId, userId): Promise<StoredTemplate[]>
  async healthCheck(): Promise<{ dynamodb: boolean; s3: boolean }>
}
```

### Migration Service

```typescript
class TemplateMigrationService {
  async migrateAllTemplates(options): Promise<MigrationResult>
  async verifyMigration(options): Promise<{ verified: boolean; details: any }>
  async rollbackMigration(options): Promise<{ success: boolean; deletedCount: number }>
}
```

This implementation provides enterprise-grade template storage with AWS cloud infrastructure, ensuring scalability, security, and reliability for your template data.
