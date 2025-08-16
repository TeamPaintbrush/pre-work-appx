const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config({ path: '.env.local' });

async function checkTableSchema() {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const tableName = process.env.DYNAMODB_USERS_TABLE;
  console.log(`🔍 Checking schema for table: ${tableName}\n`);

  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    
    console.log('✅ Table Schema:');
    console.log('Partition Key:', response.Table.KeySchema.find(k => k.KeyType === 'HASH'));
    console.log('Sort Key:', response.Table.KeySchema.find(k => k.KeyType === 'RANGE') || 'None');
    console.log('\nAttribute Definitions:');
    response.Table.AttributeDefinitions.forEach(attr => {
      console.log(`  ${attr.AttributeName}: ${attr.AttributeType}`);
    });

    console.log('\nGlobal Secondary Indexes:');
    if (response.Table.GlobalSecondaryIndexes) {
      response.Table.GlobalSecondaryIndexes.forEach(gsi => {
        console.log(`  ${gsi.IndexName}:`);
        console.log(`    Partition: ${gsi.KeySchema.find(k => k.KeyType === 'HASH').AttributeName}`);
        const sortKey = gsi.KeySchema.find(k => k.KeyType === 'RANGE');
        if (sortKey) console.log(`    Sort: ${sortKey.AttributeName}`);
      });
    } else {
      console.log('  (None)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableSchema();
