#!/usr/bin/env node

/**
 * AWS Resource Setup Script for Pre-Work App
 * This script creates all necessary AWS resources for DynamoDB, S3, and real-time sync
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configuration
const REGION = process.env.AWS_REGION || 'us-east-1';
const ENVIRONMENT = process.argv[2] || 'dev'; // dev or prod
const APP_NAME = 'PreWorkApp';

// Initialize AWS SDK
AWS.config.update({ region: REGION });
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const iam = new AWS.IAM();

console.log(`🚀 Setting up AWS resources for ${APP_NAME} (${ENVIRONMENT} environment)`);
console.log(`📍 Region: ${REGION}`);

// DynamoDB Table Definitions
const TABLES = [
  {
    TableName: `${APP_NAME}-Templates-${ENVIRONMENT}`,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'category', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 },
    StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' }
  },
  {
    TableName: `${APP_NAME}-Users-${ENVIRONMENT}`,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  },
  {
    TableName: `${APP_NAME}-Integrations-${ENVIRONMENT}`,
    KeySchema: [
      { AttributeName: 'integrationId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'integrationId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIntegrationsIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  },
  {
    TableName: `${APP_NAME}-Analytics-${ENVIRONMENT}`,
    KeySchema: [
      { AttributeName: 'recordId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'recordId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'eventType', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserAnalyticsIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      },
      {
        IndexName: 'EventTypeIndex',
        KeySchema: [
          { AttributeName: 'eventType', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
  },
  {
    TableName: `${APP_NAME}-Workflows-${ENVIRONMENT}`,
    KeySchema: [
      { AttributeName: 'workflowId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'workflowId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserWorkflowsIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'status', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    StreamSpecification: { StreamEnabled: true, StreamViewType: 'NEW_AND_OLD_IMAGES' }
  }
];

// S3 Bucket Definitions
const BUCKETS = [
  `preworkapp-storage-${ENVIRONMENT}`,
  `preworkapp-templates-${ENVIRONMENT}`,
  `preworkapp-media-${ENVIRONMENT}`,
  `preworkapp-backups-${ENVIRONMENT}`
];

// Helper Functions
async function createDynamoDBTable(tableConfig) {
  try {
    console.log(`📊 Creating DynamoDB table: ${tableConfig.TableName}`);
    const result = await dynamodb.createTable(tableConfig).promise();
    console.log(`✅ Table ${tableConfig.TableName} created successfully`);
    return result;
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log(`⚠️  Table ${tableConfig.TableName} already exists`);
      return null;
    }
    throw error;
  }
}

async function createS3Bucket(bucketName) {
  try {
    console.log(`🪣 Creating S3 bucket: ${bucketName}`);
    
    const bucketConfig = {
      Bucket: bucketName,
      CreateBucketConfiguration: REGION !== 'us-east-1' ? { LocationConstraint: REGION } : undefined
    };
    
    await s3.createBucket(bucketConfig).promise();
    
    // Configure bucket CORS
    const corsConfig = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [{
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag']
        }]
      }
    };
    
    await s3.putBucketCors(corsConfig).promise();
    console.log(`✅ S3 bucket ${bucketName} created with CORS configuration`);
  } catch (error) {
    if (error.code === 'BucketAlreadyOwnedByYou') {
      console.log(`⚠️  S3 bucket ${bucketName} already exists`);
      return;
    }
    throw error;
  }
}

async function waitForTableActive(tableName) {
  console.log(`⏳ Waiting for table ${tableName} to become active...`);
  await dynamodb.waitFor('tableExists', { TableName: tableName }).promise();
  console.log(`✅ Table ${tableName} is now active`);
}

async function generateEnvFile() {
  const envContent = `# Generated AWS Environment Variables for ${ENVIRONMENT}
# Generated on: ${new Date().toISOString()}

# AWS Core Configuration
NEXT_PUBLIC_AWS_REGION=${REGION}
AWS_REGION=${REGION}

# DynamoDB Tables
NEXT_PUBLIC_DYNAMODB_TEMPLATES_TABLE=${APP_NAME}-Templates-${ENVIRONMENT}
NEXT_PUBLIC_DYNAMODB_USERS_TABLE=${APP_NAME}-Users-${ENVIRONMENT}
NEXT_PUBLIC_DYNAMODB_INTEGRATIONS_TABLE=${APP_NAME}-Integrations-${ENVIRONMENT}
NEXT_PUBLIC_DYNAMODB_ANALYTICS_TABLE=${APP_NAME}-Analytics-${ENVIRONMENT}
NEXT_PUBLIC_DYNAMODB_WORKFLOWS_TABLE=${APP_NAME}-Workflows-${ENVIRONMENT}

# S3 Buckets
NEXT_PUBLIC_S3_BUCKET=preworkapp-storage-${ENVIRONMENT}
NEXT_PUBLIC_S3_TEMPLATES_BUCKET=preworkapp-templates-${ENVIRONMENT}
NEXT_PUBLIC_S3_MEDIA_BUCKET=preworkapp-media-${ENVIRONMENT}

# Feature Flags
NEXT_PUBLIC_ENABLE_AWS_FEATURES=true
NEXT_PUBLIC_ENABLE_REAL_TIME_SYNC=true
NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS=true

# Environment
NODE_ENV=${ENVIRONMENT === 'prod' ? 'production' : 'development'}
NEXT_PUBLIC_APP_ENV=${ENVIRONMENT}
`;

  const envFile = `.env.aws.${ENVIRONMENT}.generated`;
  fs.writeFileSync(envFile, envContent);
  console.log(`📝 Environment variables saved to ${envFile}`);
}

// Main Setup Function
async function setupAWSResources() {
  try {
    console.log(`\n🏗️  Starting AWS resource setup...\n`);
    
    // Create DynamoDB Tables
    console.log(`📊 Creating DynamoDB tables...`);
    for (const table of TABLES) {
      await createDynamoDBTable(table);
    }
    
    // Wait for tables to become active
    console.log(`\n⏳ Waiting for all tables to become active...`);
    for (const table of TABLES) {
      await waitForTableActive(table.TableName);
    }
    
    // Create S3 Buckets
    console.log(`\n🪣 Creating S3 buckets...`);
    for (const bucket of BUCKETS) {
      await createS3Bucket(bucket);
    }
    
    // Generate environment file
    console.log(`\n📝 Generating environment configuration...`);
    await generateEnvFile();
    
    console.log(`\n🎉 AWS setup completed successfully!`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Copy .env.aws.${ENVIRONMENT}.generated to .env.local (for development)`);
    console.log(`2. Or configure these variables in AWS Amplify Console (for production)`);
    console.log(`3. Update AWS credentials (ACCESS_KEY_ID and SECRET_ACCESS_KEY)`);
    console.log(`4. Run 'npm run dev' to start the application with AWS features`);
    
  } catch (error) {
    console.error(`❌ Setup failed:`, error);
    process.exit(1);
  }
}

// Validation Function
async function validateSetup() {
  console.log(`🔍 Validating AWS setup...`);
  
  // Check DynamoDB tables
  for (const table of TABLES) {
    try {
      await dynamodb.describeTable({ TableName: table.TableName }).promise();
      console.log(`✅ DynamoDB table ${table.TableName} exists`);
    } catch (error) {
      console.log(`❌ DynamoDB table ${table.TableName} not found`);
    }
  }
  
  // Check S3 buckets
  for (const bucket of BUCKETS) {
    try {
      await s3.headBucket({ Bucket: bucket }).promise();
      console.log(`✅ S3 bucket ${bucket} exists`);
    } catch (error) {
      console.log(`❌ S3 bucket ${bucket} not found`);
    }
  }
}

// Cleanup Function
async function cleanup() {
  console.log(`🧹 Cleaning up AWS resources for ${ENVIRONMENT}...`);
  
  // Delete DynamoDB tables
  for (const table of TABLES) {
    try {
      await dynamodb.deleteTable({ TableName: table.TableName }).promise();
      console.log(`🗑️  Deleted DynamoDB table: ${table.TableName}`);
    } catch (error) {
      console.log(`⚠️  Could not delete table ${table.TableName}: ${error.message}`);
    }
  }
  
  // Note: S3 buckets need to be emptied before deletion
  console.log(`📝 Note: S3 buckets must be manually emptied and deleted`);
}

// Command Line Interface
const command = process.argv[3];

switch (command) {
  case 'validate':
    validateSetup();
    break;
  case 'cleanup':
    cleanup();
    break;
  default:
    setupAWSResources();
}
