# AWS Database Integration Setup Guide

## Overview
This guide walks you through setting up AWS DynamoDB and S3 for the Pre-Work App's database and file storage system.

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured (optional but recommended)
- Node.js 18+ installed

## Quick Start

### 1. Install Dependencies
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/client-s3 @aws-sdk/lib-dynamodb @aws-sdk/s3-request-presigner zod uuid sharp @types/uuid
```

### 2. Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Update the file with your AWS credentials and resource names
3. Ensure `.env.local` is in your `.gitignore` file

### 3. AWS Resources Setup

#### Create DynamoDB Tables

**Users Table:**
```bash
aws dynamodb create-table \
  --table-name pre-work-users-dev \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
    AttributeName=role,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=RoleIndex,KeySchema=[{AttributeName=role,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Profiles Table:**
```bash
aws dynamodb create-table \
  --table-name pre-work-profiles-dev \
  --attribute-definitions \
    AttributeName=profileId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=managerId,AttributeType=S \
  --key-schema AttributeName=profileId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=ManagerIdIndex,KeySchema=[{AttributeName=managerId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Submissions Table:**
```bash
aws dynamodb create-table \
  --table-name pre-work-submissions-dev \
  --attribute-definitions \
    AttributeName=submissionId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=status,AttributeType=S \
  --key-schema AttributeName=submissionId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=StatusIndex,KeySchema=[{AttributeName=status,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Media Table:**
```bash
aws dynamodb create-table \
  --table-name pre-work-media-dev \
  --attribute-definitions \
    AttributeName=mediaId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=submissionId,AttributeType=S \
  --key-schema AttributeName=mediaId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=SubmissionIdIndex,KeySchema=[{AttributeName=submissionId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Audit Log Table:**
```bash
aws dynamodb create-table \
  --table-name pre-work-audit-log-dev \
  --attribute-definitions \
    AttributeName=logId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=entityId,AttributeType=S \
  --key-schema AttributeName=logId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=EntityIdIndex,KeySchema=[{AttributeName=entityId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

#### Create S3 Buckets

**Media Uploads Bucket:**
```bash
aws s3 mb s3://pre-work-media-uploads-dev
aws s3api put-bucket-cors --bucket pre-work-media-uploads-dev --cors-configuration file://cors-config.json
```

**Thumbnails Bucket:**
```bash
aws s3 mb s3://pre-work-thumbnails-dev
aws s3api put-bucket-policy --bucket pre-work-thumbnails-dev --policy file://thumbnail-bucket-policy.json
```

**Documents Bucket:**
```bash
aws s3 mb s3://pre-work-documents-dev
```

### 4. CORS Configuration for S3

Create `cors-config.json`:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["http://localhost:3001", "https://yourdomain.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 5. IAM User Setup

Create an IAM user with this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/pre-work-*",
        "arn:aws:dynamodb:*:*:table/pre-work-*/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl"
      ],
      "Resource": ["arn:aws:s3:::pre-work-*/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::pre-work-*"]
    }
  ]
}
```

## API Endpoints

### Users API (`/api/users`)
- **GET** - Retrieve users (by ID, email, role, or all active)
- **POST** - Create new user with profile
- **PUT** - Update user information
- **DELETE** - Deactivate user (soft delete)

### Profiles API (`/api/profiles`)
- **GET** - Retrieve profiles (by user ID, profile ID, or team members)
- **POST** - Create new profile
- **PUT** - Update profile information

### Media API (`/api/media`)
- **GET** - Generate presigned upload URLs
- **POST** - Handle download URLs, metadata, thumbnails
- **DELETE** - Delete files from S3

## Testing the Integration

Create a test file `test-aws-integration.js`:
```javascript
// Test the API endpoints
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  role: 'user',
  firstName: 'Test',
  lastName: 'User',
  jobTitle: 'Software Engineer',
  department: 'Engineering'
};

fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testUser)
})
.then(response => response.json())
.then(data => console.log('User created:', data))
.catch(error => console.error('Error:', error));
```

## Security Best Practices

1. **Environment Variables**: Never commit AWS credentials to version control
2. **IAM Roles**: Use IAM roles instead of access keys in production
3. **Bucket Policies**: Implement strict S3 bucket policies
4. **Encryption**: Enable encryption at rest for DynamoDB and S3
5. **VPC**: Use VPC endpoints for DynamoDB in production
6. **CloudTrail**: Enable CloudTrail for audit logging

## Monitoring & Alerts

Set up CloudWatch alarms for:
- DynamoDB throttling and errors
- S3 upload failures
- High API error rates
- Unusual access patterns

## Cost Optimization

1. Use **DynamoDB On-Demand** for variable workloads
2. Set up **S3 Lifecycle policies** for archiving old files
3. Use **S3 Intelligent Tiering** for automatic cost optimization
4. Monitor usage with **AWS Cost Explorer**

## Production Deployment

For production:
1. Update table names to use `-prod` suffix
2. Use AWS Cognito for authentication
3. Set up CloudFront for S3 content delivery
4. Use Lambda functions for image processing
5. Enable AWS WAF for API protection

## Troubleshooting

Common issues and solutions:

**Connection Issues:**
- Verify AWS credentials and region
- Check IAM permissions
- Ensure table names match environment variables

**Upload Issues:**
- Verify S3 bucket CORS configuration
- Check file size limits
- Ensure proper content-type headers

**Performance Issues:**
- Monitor DynamoDB capacity utilization
- Consider using DynamoDB Accelerator (DAX) for caching
- Optimize query patterns with proper GSI usage

## Support

For issues with this integration:
1. Check AWS CloudWatch logs
2. Verify environment variables
3. Test individual components separately
4. Review IAM permissions

This integration provides a scalable, enterprise-grade backend for your Pre-Work App with full AWS integration.
