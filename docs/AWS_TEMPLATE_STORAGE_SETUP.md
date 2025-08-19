# AWS Template Storage Setup Guide

## Overview
This guide helps you set up AWS storage for all 102 templates in your Pre-Work App. The templates have been validated and are ready for sync.

## Current Status
✅ **102 templates validated and ready**
- Healthcare & Medical: 12 templates
- Construction & Trade: 10 templates
- Manufacturing & Quality: 10 templates
- Retail & Commerce: 10 templates
- Technology & Development: 10 templates
- Education & Training: 10 templates
- Finance & Accounting: 10 templates
- Legal & Compliance: 10 templates
- Marketing & Sales: 10 templates
- Human Resources: 10 templates

## Prerequisites
1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js environment with TypeScript support

## Step 1: AWS Configuration

### 1.1 Create Environment File
Copy `.env.local.example` to `.env.local` and configure:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Tables
DYNAMODB_TEMPLATES_TABLE=PreWorkApp-Templates
DYNAMODB_TEMPLATES_METADATA_TABLE=PreWorkApp-Templates-Metadata

# Optional: Organization settings
ORGANIZATION_ID=your_org_id
```

### 1.2 Required AWS Permissions
Your AWS user/role needs these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/PreWorkApp-Templates",
        "arn:aws:dynamodb:*:*:table/PreWorkApp-Templates-Metadata"
      ]
    }
  ]
}
```

## Step 2: Create DynamoDB Tables

### 2.1 Templates Table
```bash
aws dynamodb create-table \
  --table-name PreWorkApp-Templates \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2.2 Templates Metadata Table
```bash
aws dynamodb create-table \
  --table-name PreWorkApp-Templates-Metadata \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2.3 Using PowerShell Script (Alternative)
Run the provided setup script:
```powershell
.\setup-aws-resources.ps1
```

## Step 3: Sync Templates to AWS

### 3.1 Validate Templates (Optional)
```bash
npx tsx scripts/validate-templates.ts
```

### 3.2 Run AWS Sync
```bash
npx tsx scripts/save-templates-to-aws.ts
```

### 3.3 Verify Sync
Check the output for:
- ✅ Success count (should be 102)
- ❌ Error count (should be 0)
- 📊 Category breakdown
- ⏱️ Performance metrics

## Step 4: Verification

### 4.1 Check DynamoDB Console
1. Go to AWS DynamoDB Console
2. Navigate to Tables → PreWorkApp-Templates
3. Browse items to see your templates
4. Verify all 102 templates are present

### 4.2 Test Template Retrieval
```bash
# Test getting a specific template
aws dynamodb get-item \
  --table-name PreWorkApp-Templates \
  --key '{"id":{"S":"patient-room-prep"}}' \
  --region us-east-1
```

### 4.3 Check Template Counts
```bash
# Count total templates
aws dynamodb scan \
  --table-name PreWorkApp-Templates \
  --select COUNT \
  --region us-east-1
```

## Step 5: Integration with App

### 5.1 Update App Configuration
Ensure your app uses the AWS service:
```typescript
import { AWSTemplateService } from '../services/aws/AWSTemplateService';

const templateService = new AWSTemplateService({
  enableRealTimeSync: true,
  enableVersioning: true,
  cacheTimeout: 300000
});
```

### 5.2 Test Live Integration
Run your app and verify templates load from AWS:
```bash
npm run dev
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify AWS credentials in `.env.local`
   - Check IAM permissions
   - Test with AWS CLI: `aws sts get-caller-identity`

2. **Table Not Found**
   - Ensure tables are created in correct region
   - Check table names match environment variables
   - Wait for table creation to complete

3. **Rate Limiting**
   - AWS DynamoDB has rate limits
   - The sync script includes batch processing and delays
   - Consider using provisioned capacity for high volume

4. **Template Validation Errors**
   - Run validation script first
   - Check template structure matches TypeScript types
   - Fix any missing required fields

### Support Commands

```bash
# Check AWS configuration
aws configure list

# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Describe table structure
aws dynamodb describe-table --table-name PreWorkApp-Templates --region us-east-1

# Check table item count
aws dynamodb scan --table-name PreWorkApp-Templates --select COUNT --region us-east-1
```

## Cost Estimates

### DynamoDB Costs (PAY_PER_REQUEST)
- Storage: ~$0.01/month for 102 templates (~100KB)
- Reads: $0.25 per million reads
- Writes: $1.25 per million writes

### Expected Monthly Cost: < $1.00

## Security Best Practices

1. **Use IAM Roles** instead of access keys when possible
2. **Enable encryption** at rest and in transit
3. **Monitor access** with CloudTrail
4. **Rotate credentials** regularly
5. **Use least privilege** permissions

## Next Steps

After successful AWS sync:
1. ✅ Monitor sync performance
2. ✅ Set up automated backups
3. ✅ Configure real-time sync
4. ✅ Add template versioning
5. ✅ Implement collaborative editing

## Support

If you need help:
1. Check the generated reports in `./reports/`
2. Review error logs from sync scripts
3. Verify AWS console shows your templates
4. Test template retrieval in your app

---

**Template Count Summary**: 102 templates across 10 categories
**Validation Status**: ✅ All templates valid
**AWS Ready**: ✅ Ready for sync
**Estimated Sync Time**: 3-5 minutes
