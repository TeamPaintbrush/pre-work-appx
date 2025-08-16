# AWS Setup Scripts

This directory contains PowerShell scripts for setting up AWS infrastructure for the Pre-Work App.

## Files

### `setup-aws-resources.ps1`

**Purpose**: Creates all required AWS resources (DynamoDB tables and S3 buckets) for the Pre-Work App.

**Usage**:
```powershell
# Run from project root
.\scripts\aws\setup-aws-resources.ps1

# With custom parameters
.\scripts\aws\setup-aws-resources.ps1 -Environment "prod" -ProjectName "my-app" -Region "us-west-2"
```

**Prerequisites**:
1. AWS CLI installed and configured
2. IAM user/role with the following permissions:
   - `dynamodb:CreateTable`
   - `dynamodb:DescribeTable`
   - `s3:CreateBucket`
   - `s3:HeadBucket`
   - `s3:PutBucketVersioning`
   - `s3:PutBucketCors`
   - `s3:PutBucketPolicy`

**What it creates**:

**DynamoDB Tables**:
- `{ProjectName}-users-{Environment}`
- `{ProjectName}-profiles-{Environment}`
- `{ProjectName}-submissions-{Environment}`
- `{ProjectName}-media-{Environment}`
- `{ProjectName}-audit-log-{Environment}`

**S3 Buckets**:
- `{ProjectName}-media-uploads-{Environment}` (private)
- `{ProjectName}-thumbnails-{Environment}` (public read)
- `{ProjectName}-documents-{Environment}` (private)

**Parameters**:
- `Environment`: Environment suffix (default: "dev")
- `ProjectName`: Project prefix (default: "pre-work")
- `Region`: AWS region (default: "us-east-1")

**Notes**:
- Script creates temporary JSON files (`cors-config.json`, `public-read-policy.json`) which are automatically cleaned up
- These temporary files are ignored by git
- Script is idempotent - safe to run multiple times

## Required IAM Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DescribeTable",
                "s3:CreateBucket",
                "s3:HeadBucket",
                "s3:PutBucketVersioning",
                "s3:PutBucketCors",
                "s3:PutBucketPolicy"
            ],
            "Resource": "*"
        }
    ]
}
```
