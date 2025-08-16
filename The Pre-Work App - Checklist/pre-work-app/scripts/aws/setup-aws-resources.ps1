# PowerShell AWS Setup Script for Pre-Work App
# This script creates all required AWS resources for the application
# Updated with approved PowerShell verbs

param(
    [string]$Environment = "dev",
    [string]$ProjectName = "pre-work",
    [string]$Region = "us-east-1"
)

Write-Host "🚀 Pre-Work App AWS Setup Script" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "Environment: $Environment"
Write-Host "Project: $ProjectName"
Write-Host "Region: $Region"
Write-Host ""

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
    Write-Host "✅ AWS CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
}

# Check if AWS CLI is configured
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS CLI is configured" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI is not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Function to create DynamoDB table
function New-DynamoDBTable {
    param(
        [string]$TableName,
        [string]$PrimaryKey,
        [string]$GSIConfigs = ""
    )
    
    Write-Host "Creating DynamoDB table: $TableName" -ForegroundColor Yellow
    
    # Check if table already exists
    try {
        aws dynamodb describe-table --table-name $TableName | Out-Null
        Write-Host "ℹ️  Table $TableName already exists" -ForegroundColor Blue
        return $true
    } catch {
        # Table doesn't exist, create it
    }
    
    # Build the create-table command
    $cmd = "aws dynamodb create-table --table-name $TableName"
    $cmd += " --attribute-definitions AttributeName=$PrimaryKey,AttributeType=S"
    $cmd += " --key-schema AttributeName=$PrimaryKey,KeyType=HASH"
    $cmd += " --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5"
    
    # Add GSI configurations if provided
    if ($GSIConfigs) {
        $cmd += " $GSIConfigs"
    }
    
    try {
        Invoke-Expression $cmd | Out-Null
        Write-Host "✅ Created table: $TableName" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to create table: $TableName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Function to create S3 bucket
function New-S3Bucket {
    param(
        [string]$BucketName,
        [bool]$IsPublic = $false
    )
    
    Write-Host "Creating S3 bucket: $BucketName" -ForegroundColor Yellow
    
    # Check if bucket already exists
    try {
        aws s3api head-bucket --bucket $BucketName 2>$null
        Write-Host "ℹ️  Bucket $BucketName already exists" -ForegroundColor Blue
        return $true
    } catch {
        # Bucket doesn't exist, create it
    }
    
    try {
        # Create bucket
        if ($Region -eq "us-east-1") {
            aws s3api create-bucket --bucket $BucketName | Out-Null
        } else {
            aws s3api create-bucket --bucket $BucketName --create-bucket-configuration "LocationConstraint=$Region" | Out-Null
        }
        
        # Enable versioning
        aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled | Out-Null
        
        # Set up CORS for media bucket
        if ($BucketName -like "*media*") {
            $corsConfig = @"
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
"@
            $corsConfig | Out-File -FilePath "cors-config.json" -Encoding UTF8
            aws s3api put-bucket-cors --bucket $BucketName --cors-configuration file://cors-config.json | Out-Null
            Remove-Item "cors-config.json"
        }
        
        # Make thumbnails bucket public for read access
        if ($BucketName -like "*thumbnails*") {
            $publicPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BucketName/*"
    }
  ]
}
"@
            $publicPolicy | Out-File -FilePath "public-read-policy.json" -Encoding UTF8
            aws s3api put-bucket-policy --bucket $BucketName --policy file://public-read-policy.json | Out-Null
            Remove-Item "public-read-policy.json"
        }
        
        Write-Host "✅ Created bucket: $BucketName" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to create bucket: $BucketName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Start creating resources
Write-Host "📊 Creating DynamoDB Tables..." -ForegroundColor Cyan
Write-Host ""

# Users Table
$usersTable = "$ProjectName-users-$Environment"
$usersGSI = "--attribute-definitions AttributeName=email,AttributeType=S AttributeName=role,AttributeType=S --global-secondary-indexes IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=RoleIndex,KeySchema=[{AttributeName=role,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"
New-DynamoDBTable -TableName $usersTable -PrimaryKey "userId" -GSIConfigs $usersGSI

# Profiles Table
$profilesTable = "$ProjectName-profiles-$Environment"
$profilesGSI = "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=managerId,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=ManagerIdIndex,KeySchema=[{AttributeName=managerId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"
New-DynamoDBTable -TableName $profilesTable -PrimaryKey "profileId" -GSIConfigs $profilesGSI

# Submissions Table
$submissionsTable = "$ProjectName-submissions-$Environment"
$submissionsGSI = "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=status,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=StatusIndex,KeySchema=[{AttributeName=status,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"
New-DynamoDBTable -TableName $submissionsTable -PrimaryKey "submissionId" -GSIConfigs $submissionsGSI

# Media Table
$mediaTable = "$ProjectName-media-$Environment"
$mediaGSI = "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=submissionId,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=SubmissionIdIndex,KeySchema=[{AttributeName=submissionId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"
New-DynamoDBTable -TableName $mediaTable -PrimaryKey "mediaId" -GSIConfigs $mediaGSI

# Audit Log Table
$auditTable = "$ProjectName-audit-log-$Environment"
$auditGSI = "--attribute-definitions AttributeName=userId,AttributeType=S AttributeName=entityId,AttributeType=S --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=EntityIdIndex,KeySchema=[{AttributeName=entityId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}"
New-DynamoDBTable -TableName $auditTable -PrimaryKey "logId" -GSIConfigs $auditGSI

Write-Host ""
Write-Host "🗂️  Creating S3 Buckets..." -ForegroundColor Cyan
Write-Host ""

# Create S3 buckets
New-S3Bucket -BucketName "$ProjectName-media-uploads-$Environment" -IsPublic $false
New-S3Bucket -BucketName "$ProjectName-thumbnails-$Environment" -IsPublic $true
New-S3Bucket -BucketName "$ProjectName-documents-$Environment" -IsPublic $false

Write-Host ""
Write-Host "📋 Resource Summary" -ForegroundColor Cyan
Write-Host "==================="
Write-Host ""
Write-Host "DynamoDB Tables:"
Write-Host "  - $ProjectName-users-$Environment"
Write-Host "  - $ProjectName-profiles-$Environment"
Write-Host "  - $ProjectName-submissions-$Environment"
Write-Host "  - $ProjectName-media-$Environment"
Write-Host "  - $ProjectName-audit-log-$Environment"
Write-Host ""
Write-Host "S3 Buckets:"
Write-Host "  - $ProjectName-media-uploads-$Environment"
Write-Host "  - $ProjectName-thumbnails-$Environment"
Write-Host "  - $ProjectName-documents-$Environment"
Write-Host ""
Write-Host "✅ AWS resources created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env.local file with the resource names"
Write-Host "2. Create an IAM user with appropriate permissions"
Write-Host "3. Test the integration with 'npm run test:aws'"
Write-Host ""
Write-Host "💡 Environment variables for .env.local:" -ForegroundColor Cyan
Write-Host "AWS_REGION=$Region"
Write-Host "DYNAMODB_USERS_TABLE=$ProjectName-users-$Environment"
Write-Host "DYNAMODB_PROFILES_TABLE=$ProjectName-profiles-$Environment"
Write-Host "DYNAMODB_SUBMISSIONS_TABLE=$ProjectName-submissions-$Environment"
Write-Host "DYNAMODB_MEDIA_TABLE=$ProjectName-media-$Environment"
Write-Host "DYNAMODB_AUDIT_TABLE=$ProjectName-audit-log-$Environment"
Write-Host "S3_MEDIA_BUCKET=$ProjectName-media-uploads-$Environment"
Write-Host "S3_THUMBNAILS_BUCKET=$ProjectName-thumbnails-$Environment"
Write-Host "S3_DOCUMENTS_BUCKET=$ProjectName-documents-$Environment"
Write-Host ""
Write-Host "🚀 Setup complete! Your AWS backend is ready." -ForegroundColor Green
