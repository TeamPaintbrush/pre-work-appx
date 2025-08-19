#!/usr/bin/env node

// AWS DynamoDB Table Setup for Enterprise Features
// Run with: node scripts/setup-enterprise-tables.js

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  CreateTableCommand, 
  DescribeTableCommand, 
  ListTablesCommand 
} = require('@aws-sdk/client-dynamodb');

require('dotenv').config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ENTERPRISE_TABLES = [
  {
    TableName: process.env.WORKSPACES_TABLE || 'PreWorkApp-Workspaces-Dev',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'ownerId', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ByOwner',
        KeySchema: [
          { AttributeName: 'ownerId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    TableName: process.env.CUSTOM_FIELDS_TABLE || 'PreWorkApp-CustomFields-Dev',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'workspaceId', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ByWorkspace',
        KeySchema: [
          { AttributeName: 'workspaceId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    TableName: process.env.WORKFLOWS_TABLE || 'PreWorkApp-Workflows-Dev',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'workspaceId', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ByWorkspace',
        KeySchema: [
          { AttributeName: 'workspaceId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    TableName: process.env.BOARD_CONFIGS_TABLE || 'PreWorkApp-BoardConfigs-Dev',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'workspaceId', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ByWorkspace',
        KeySchema: [
          { AttributeName: 'workspaceId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    TableName: process.env.SYNC_OPERATIONS_TABLE || 'PreWorkApp-SyncOperations-Dev',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'workspaceId', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ByWorkspaceStatus',
        KeySchema: [
          { AttributeName: 'workspaceId', KeyType: 'HASH' },
          { AttributeName: 'status', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
];

async function createTable(tableConfig) {
  try {
    const command = new CreateTableCommand({
      ...tableConfig,
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });

    console.log(`Creating table: ${tableConfig.TableName}...`);
    await client.send(command);
    console.log(`✅ Table ${tableConfig.TableName} created successfully`);
    
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`ℹ️  Table ${tableConfig.TableName} already exists`);
    } else {
      console.error(`❌ Error creating table ${tableConfig.TableName}:`, error.message);
    }
  }
}

async function checkTableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    return false;
  }
}

async function setupEnterpriseTables() {
  console.log('🚀 Setting up Enterprise DynamoDB Tables...\n');

  // Check AWS credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  // List existing tables
  try {
    const listCommand = new ListTablesCommand({});
    const existingTables = await client.send(listCommand);
    console.log('📋 Existing tables:', existingTables.TableNames?.length || 0);
  } catch (error) {
    console.error('❌ Cannot connect to AWS DynamoDB:', error.message);
    process.exit(1);
  }

  // Create enterprise tables
  for (const tableConfig of ENTERPRISE_TABLES) {
    const exists = await checkTableExists(tableConfig.TableName);
    if (!exists) {
      await createTable(tableConfig);
      // Wait a bit between table creations
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`✅ Table ${tableConfig.TableName} already exists`);
    }
  }

  console.log('\n🎉 Enterprise table setup complete!');
  console.log('\nNext steps:');
  console.log('1. Copy .env.local.enterprise to .env.local');
  console.log('2. Restart your development server');
  console.log('3. Enterprise features will be available in your app');
}

if (require.main === module) {
  setupEnterpriseTables().catch(console.error);
}

module.exports = { setupEnterpriseTables };
