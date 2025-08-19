#!/usr/bin/env node

// AWS Template Storage Setup Script
// Creates necessary AWS resources for template storage

const { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand,
  ListTablesCommand 
} = require('@aws-sdk/client-dynamodb');

const { 
  S3Client, 
  CreateBucketCommand, 
  HeadBucketCommand,
  PutBucketVersioningCommand,
  PutBucketEncryptionCommand,
  PutBucketCorsCommand 
} = require('@aws-sdk/client-s3');

require('dotenv').config({ path: '.env.local' });

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const dynamoTableName = process.env.AWS_DYNAMODB_TEMPLATES_TABLE || 'prework-templates';
const s3BucketName = process.env.AWS_S3_TEMPLATES_BUCKET || 'prework-templates-storage';

const dynamoClient = new DynamoDBClient(config);
const s3Client = new S3Client(config);

async function createDynamoTable() {
  try {
    console.log(`🔄 Creating DynamoDB table: ${dynamoTableName}`);
    
    // Check if table already exists
    try {
      await dynamoClient.send(new DescribeTableCommand({
        TableName: dynamoTableName
      }));
      console.log(`✅ DynamoDB table ${dynamoTableName} already exists`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    // Create table
    const createTableParams = {
      TableName: dynamoTableName,
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'GSI1PK', AttributeType: 'S' },
        { AttributeName: 'GSI1SK', AttributeType: 'S' },
        { AttributeName: 'GSI2PK', AttributeType: 'S' },
        { AttributeName: 'GSI2SK', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' },
          BillingMode: 'PAY_PER_REQUEST'
        },
        {
          IndexName: 'GSI2',
          KeySchema: [
            { AttributeName: 'GSI2PK', KeyType: 'HASH' },
            { AttributeName: 'GSI2SK', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' },
          BillingMode: 'PAY_PER_REQUEST'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamEnabled: true,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      },
      SSESpecification: {
        Enabled: true
      },
      Tags: [
        { Key: 'Project', Value: 'PreWorkApp' },
        { Key: 'Environment', Value: 'Production' },
        { Key: 'Purpose', Value: 'TemplateStorage' }
      ]
    };

    await dynamoClient.send(new CreateTableCommand(createTableParams));
    console.log(`✅ DynamoDB table ${dynamoTableName} created successfully`);
    
    // Wait for table to become active
    console.log('⏳ Waiting for table to become active...');
    let tableStatus = 'CREATING';
    while (tableStatus !== 'ACTIVE') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const response = await dynamoClient.send(new DescribeTableCommand({
        TableName: dynamoTableName
      }));
      tableStatus = response.Table.TableStatus;
      console.log(`📊 Table status: ${tableStatus}`);
    }
    
    console.log(`🎉 DynamoDB table ${dynamoTableName} is now active`);
    
  } catch (error) {
    console.error(`❌ Error creating DynamoDB table:`, error);
    throw error;
  }
}

async function createS3Bucket() {
  try {
    console.log(`🔄 Creating S3 bucket: ${s3BucketName}`);
    
    // Check if bucket already exists
    try {
      await s3Client.send(new HeadBucketCommand({
        Bucket: s3BucketName
      }));
      console.log(`✅ S3 bucket ${s3BucketName} already exists`);
      return;
    } catch (error) {
      if (error.name !== 'NotFound') {
        throw error;
      }
    }

    // Create bucket
    const createBucketParams = {
      Bucket: s3BucketName,
      CreateBucketConfiguration: config.region !== 'us-east-1' ? {
        LocationConstraint: config.region
      } : undefined
    };

    await s3Client.send(new CreateBucketCommand(createBucketParams));
    console.log(`✅ S3 bucket ${s3BucketName} created successfully`);

    // Enable versioning
    await s3Client.send(new PutBucketVersioningCommand({
      Bucket: s3BucketName,
      VersioningConfiguration: {
        Status: 'Enabled'
      }
    }));
    console.log(`✅ Versioning enabled for ${s3BucketName}`);

    // Enable encryption
    await s3Client.send(new PutBucketEncryptionCommand({
      Bucket: s3BucketName,
      ServerSideEncryptionConfiguration: {
        Rules: [
          {
            ApplyServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256'
            }
          }
        ]
      }
    }));
    console.log(`✅ Encryption enabled for ${s3BucketName}`);

    // Configure CORS for web access
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: s3BucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000
          }
        ]
      }
    }));
    console.log(`✅ CORS configured for ${s3BucketName}`);

  } catch (error) {
    console.error(`❌ Error creating S3 bucket:`, error);
    throw error;
  }
}

async function verifySetup() {
  try {
    console.log('🔍 Verifying AWS setup...');
    
    // Verify DynamoDB
    const tableResponse = await dynamoClient.send(new DescribeTableCommand({
      TableName: dynamoTableName
    }));
    console.log(`✅ DynamoDB table verified: ${tableResponse.Table.TableStatus}`);
    
    // Verify S3
    await s3Client.send(new HeadBucketCommand({
      Bucket: s3BucketName
    }));
    console.log(`✅ S3 bucket verified: ${s3BucketName}`);
    
    console.log('🎉 AWS setup verification complete!');
    
    return {
      dynamodb: {
        tableName: dynamoTableName,
        status: tableResponse.Table.TableStatus,
        itemCount: tableResponse.Table.ItemCount,
        sizeBytes: tableResponse.Table.TableSizeBytes
      },
      s3: {
        bucketName: s3BucketName,
        region: config.region
      }
    };
    
  } catch (error) {
    console.error('❌ Setup verification failed:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Setting up AWS resources for Template Storage...');
    console.log(`📍 Region: ${config.region}`);
    console.log(`📊 DynamoDB Table: ${dynamoTableName}`);
    console.log(`🪣 S3 Bucket: ${s3BucketName}`);
    console.log('');

    // Validate credentials
    if (!config.credentials.accessKeyId || !config.credentials.secretAccessKey) {
      throw new Error('AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
    }

    // Create resources
    await createDynamoTable();
    await createS3Bucket();
    
    // Verify setup
    const verification = await verifySetup();
    
    console.log('');
    console.log('📋 Setup Summary:');
    console.log('================');
    console.log(`DynamoDB Table: ${verification.dynamodb.tableName} (${verification.dynamodb.status})`);
    console.log(`S3 Bucket: ${verification.s3.bucketName} (${verification.s3.region})`);
    console.log('');
    console.log('🎉 AWS Template Storage setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env.local file with the AWS configuration');
    console.log('2. Run the template migration to move existing templates to AWS');
    console.log('3. Test the AWS Template Dashboard in your application');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createDynamoTable,
  createS3Bucket,
  verifySetup,
  main
};
