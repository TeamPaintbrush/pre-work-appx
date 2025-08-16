# Manual AWS Setup Guide for Pre-Work App

## Prerequisites

### 1. Install AWS CLI
Download and install the AWS CLI from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

### 2. Configure AWS CLI
```bash
aws configure
```
You'll need:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region (e.g., us-east-1)
- Default output format (json)

### 3. Verify AWS Configuration
```bash
aws sts get-caller-identity
```

## Step 1: Create DynamoDB Tables

### Users Table
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

### Profiles Table
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

### Submissions Table
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

### Media Table
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

### Audit Log Table
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

## Step 2: Create S3 Buckets

### Media Uploads Bucket
```bash
aws s3 mb s3://pre-work-media-uploads-dev
aws s3api put-bucket-versioning --bucket pre-work-media-uploads-dev --versioning-configuration Status=Enabled
```

### CORS Configuration for Media Bucket
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

Apply CORS:
```bash
aws s3api put-bucket-cors --bucket pre-work-media-uploads-dev --cors-configuration file://cors-config.json
```

### Thumbnails Bucket
```bash
aws s3 mb s3://pre-work-thumbnails-dev
aws s3api put-bucket-versioning --bucket pre-work-thumbnails-dev --versioning-configuration Status=Enabled
```

### Documents Bucket
```bash
aws s3 mb s3://pre-work-documents-dev
aws s3api put-bucket-versioning --bucket pre-work-documents-dev --versioning-configuration Status=Enabled
```

## Step 3: Create IAM User and Policy

### Create IAM User
```bash
aws iam create-user --user-name pre-work-app-user
```

### Create Access Keys
```bash
aws iam create-access-key --user-name pre-work-app-user
```
**Save the output** - you'll need the AccessKeyId and SecretAccessKey for your .env.local file.

### Create IAM Policy
Create `pre-work-policy.json`:
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

### Attach Policy to User
```bash
aws iam create-policy --policy-name PreWorkAppPolicy --policy-document file://pre-work-policy.json
aws iam attach-user-policy --user-name pre-work-app-user --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/PreWorkAppPolicy
```

## Step 4: Configure Environment Variables

Create or update your `.env.local` file:
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_from_step_3
AWS_SECRET_ACCESS_KEY=your_secret_key_from_step_3

# DynamoDB Tables
DYNAMODB_USERS_TABLE=pre-work-users-dev
DYNAMODB_PROFILES_TABLE=pre-work-profiles-dev
DYNAMODB_SUBMISSIONS_TABLE=pre-work-submissions-dev
DYNAMODB_MEDIA_TABLE=pre-work-media-dev
DYNAMODB_AUDIT_TABLE=pre-work-audit-log-dev

# S3 Buckets
S3_MEDIA_BUCKET=pre-work-media-uploads-dev
S3_THUMBNAILS_BUCKET=pre-work-thumbnails-dev
S3_DOCUMENTS_BUCKET=pre-work-documents-dev

# NextAuth (for future authentication)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3001
```

## Step 5: Test the Setup

Run the integration test:
```bash
npm run test:aws
```

If successful, you should see:
```
✅ AWS configuration is valid
✅ Database connection successful
✅ Test user created
✅ Test profile created
...
🎉 All tests passed! AWS integration is working correctly.
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**
   - Check IAM policy is attached correctly
   - Verify resource ARNs match your account ID

2. **Table Already Exists**
   - Normal if running setup multiple times
   - Tables are reused if they exist

3. **Bucket Name Already Taken**
   - S3 bucket names must be globally unique
   - Add a random suffix to bucket names

4. **Region Mismatch**
   - Ensure all resources are in the same region
   - Update AWS_REGION in .env.local

### Verification Commands:

```bash
# List DynamoDB tables
aws dynamodb list-tables

# List S3 buckets
aws s3 ls

# Check IAM user
aws iam get-user --user-name pre-work-app-user
```

## Cost Considerations

With the current setup (5 DynamoDB tables, 3 S3 buckets, minimal usage):
- **DynamoDB**: ~$2-5/month for development
- **S3**: ~$1-3/month for storage
- **Total**: ~$3-8/month for development environment

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use different environments** (dev, staging, prod) with separate resources
3. **Enable CloudTrail** for audit logging in production
4. **Use IAM roles** instead of access keys in production
5. **Enable MFA** for AWS console access

Your AWS backend is now ready for the Pre-Work App! 🚀
