#!/bin/bash

# AWS Setup Script for Pre-Work App
# This script creates all required AWS resources for the application

set -e

echo "🚀 Pre-Work App AWS Setup Script"
echo "================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="dev"
PROJECT_NAME="pre-work"
REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}Configuration:${NC}"
echo "Environment: $ENVIRONMENT"
echo "Project: $PROJECT_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI is installed and configured${NC}"
echo ""

# Function to create DynamoDB table
create_dynamodb_table() {
    local table_name=$1
    local primary_key=$2
    local gsi_configs=$3
    
    echo -e "${YELLOW}Creating DynamoDB table: $table_name${NC}"
    
    if aws dynamodb describe-table --table-name "$table_name" &> /dev/null; then
        echo -e "${BLUE}ℹ️  Table $table_name already exists${NC}"
        return 0
    fi
    
    # Build the create-table command
    local cmd="aws dynamodb create-table --table-name $table_name"
    cmd="$cmd --attribute-definitions AttributeName=$primary_key,AttributeType=S"
    cmd="$cmd --key-schema AttributeName=$primary_key,KeyType=HASH"
    cmd="$cmd --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5"
    
    # Add GSI configurations if provided
    if [ ! -z "$gsi_configs" ]; then
        cmd="$cmd $gsi_configs"
    fi
    
    if eval $cmd; then
        echo -e "${GREEN}✅ Created table: $table_name${NC}"
    else
        echo -e "${RED}❌ Failed to create table: $table_name${NC}"
        return 1
    fi
}

# Function to create S3 bucket
create_s3_bucket() {
    local bucket_name=$1
    local is_public=$2
    
    echo -e "${YELLOW}Creating S3 bucket: $bucket_name${NC}"
    
    if aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        echo -e "${BLUE}ℹ️  Bucket $bucket_name already exists${NC}"
        return 0
    fi
    
    # Create bucket
    if [ "$REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$bucket_name"
    else
        aws s3api create-bucket --bucket "$bucket_name" --create-bucket-configuration LocationConstraint="$REGION"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning --bucket "$bucket_name" --versioning-configuration Status=Enabled
    
    # Set up CORS for media bucket
    if [[ "$bucket_name" == *"media"* ]]; then
        cat > cors-config.json << EOF
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
EOF
        aws s3api put-bucket-cors --bucket "$bucket_name" --cors-configuration file://cors-config.json
        rm cors-config.json
    fi
    
    # Make thumbnails bucket public for read access
    if [[ "$bucket_name" == *"thumbnails"* ]]; then
        cat > public-read-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$bucket_name/*"
    }
  ]
}
EOF
        aws s3api put-bucket-policy --bucket "$bucket_name" --policy file://public-read-policy.json
        rm public-read-policy.json
    fi
    
    echo -e "${GREEN}✅ Created bucket: $bucket_name${NC}"
}

# Start creating resources
echo -e "${BLUE}📊 Creating DynamoDB Tables...${NC}"
echo ""

# Users Table
create_dynamodb_table \
    "${PROJECT_NAME}-users-${ENVIRONMENT}" \
    "userId" \
    "--attribute-definitions AttributeName=email,AttributeType=S AttributeName=role,AttributeType=S --global-secondary-indexes IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=RoleIndex,KeySchema=[{AttributeName=role,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"

# Profiles Table
create_dynamodb_table \
    "${PROJECT_NAME}-profiles-${ENVIRONMENT}" \
    "profileId" \
    "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=managerId,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=ManagerIdIndex,KeySchema=[{AttributeName=managerId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"

# Submissions Table
create_dynamodb_table \
    "${PROJECT_NAME}-submissions-${ENVIRONMENT}" \
    "submissionId" \
    "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=status,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=StatusIndex,KeySchema=[{AttributeName=status,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"

# Media Table
create_dynamodb_table \
    "${PROJECT_NAME}-media-${ENVIRONMENT}" \
    "mediaId" \
    "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=submissionId,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=SubmissionIdIndex,KeySchema=[{AttributeName=submissionId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"

# Audit Log Table
create_dynamodb_table \
    "${PROJECT_NAME}-audit-log-${ENVIRONMENT}" \
    "logId" \
    "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=entityId,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=EntityIdIndex,KeySchema=[{AttributeName=entityId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"

echo ""
echo -e "${BLUE}🗂️  Creating S3 Buckets...${NC}"
echo ""

# Create S3 buckets
create_s3_bucket "${PROJECT_NAME}-media-uploads-${ENVIRONMENT}" false
create_s3_bucket "${PROJECT_NAME}-thumbnails-${ENVIRONMENT}" true
create_s3_bucket "${PROJECT_NAME}-documents-${ENVIRONMENT}" false

echo ""
echo -e "${BLUE}📋 Resource Summary${NC}"
echo "==================="
echo ""
echo "DynamoDB Tables:"
echo "  - ${PROJECT_NAME}-users-${ENVIRONMENT}"
echo "  - ${PROJECT_NAME}-profiles-${ENVIRONMENT}"
echo "  - ${PROJECT_NAME}-submissions-${ENVIRONMENT}"
echo "  - ${PROJECT_NAME}-media-${ENVIRONMENT}"
echo "  - ${PROJECT_NAME}-audit-log-${ENVIRONMENT}"
echo ""
echo "S3 Buckets:"
echo "  - ${PROJECT_NAME}-media-uploads-${ENVIRONMENT}"
echo "  - ${PROJECT_NAME}-thumbnails-${ENVIRONMENT}"
echo "  - ${PROJECT_NAME}-documents-${ENVIRONMENT}"
echo ""
echo -e "${GREEN}✅ AWS resources created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update your .env.local file with the resource names"
echo "2. Create an IAM user with appropriate permissions"
echo "3. Test the integration with 'npm run test:aws'"
echo ""
echo -e "${BLUE}💡 IAM Policy needed for your user:${NC}"
cat << 'EOF'
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
EOF

echo ""
echo -e "${GREEN}🚀 Setup complete! Your AWS backend is ready.${NC}"
