# AWS Test Scripts

This directory contains test scripts for validating AWS integration.

## Files

### `test-aws-integration.ts`

**Purpose**: Comprehensive AWS integration test that validates all AWS services and enterprise features.

**Usage**:
```bash
# Run from project root
npm run test:aws

# Or directly
npx tsx scripts/tests/test-aws-integration.ts
```

**What it tests**:
- Environment variables configuration
- DynamoDB connection and operations (CRUD)
- S3 connection
- All required tables and buckets exist

### `test-dynamodb-permissions.js`

**Purpose**: Quick test to verify DynamoDB permissions and list available tables.

**Usage**:
```bash
node scripts/tests/test-dynamodb-permissions.js
```

### `test-credentials.js`

**Purpose**: Direct AWS credentials validation test.

**Usage**:
```bash
node scripts/tests/test-credentials.js
```

### `create-missing-tables.js`

**Purpose**: Helper script to identify missing DynamoDB tables and guide setup.

**Usage**:
```bash
node scripts/tests/create-missing-tables.js
```

## Prerequisites

1. AWS credentials configured (`.env.local` file with `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. All required AWS resources created (run `scripts/aws/setup-aws-resources.ps1` first)
3. Environment variables properly set in `.env.local`

## Environment Variables Required

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_USERS_TABLE=pre-work-users-dev
DYNAMODB_PROFILES_TABLE=pre-work-profiles-dev
DYNAMODB_SUBMISSIONS_TABLE=pre-work-submissions-dev
DYNAMODB_MEDIA_TABLE=pre-work-media-dev
DYNAMODB_AUDIT_TABLE=pre-work-audit-log-dev
DYNAMODB_TEAMS_TABLE=pre-work-teams-dev
DYNAMODB_ASSIGNMENTS_TABLE=pre-work-assignments-dev
DYNAMODB_SESSIONS_TABLE=pre-work-sessions-dev
S3_MEDIA_BUCKET=pre-work-media-uploads-dev
S3_THUMBNAILS_BUCKET=pre-work-thumbnails-dev
S3_DOCUMENTS_BUCKET=pre-work-documents-dev
```

## Troubleshooting

**"Resolved credential object is not valid"**:
- Check AWS credentials in `.env.local`
- Verify IAM permissions
- Ensure AWS region is correct

**"Table not found"**:
- Run the AWS setup script first
- Verify table names match environment variables
- Check AWS region configuration
