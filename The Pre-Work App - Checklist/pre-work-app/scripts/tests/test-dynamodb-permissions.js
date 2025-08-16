// Test DynamoDB permissions specifically
require('dotenv').config({ path: '.env.local' });
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

async function testDynamoDBPermissions() {
  console.log('🔧 Testing DynamoDB Permissions...\n');

  // Test basic DynamoDB connection
  const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    console.log('📋 Listing DynamoDB tables...');
    const result = await dynamoClient.send(new ListTablesCommand({}));
    
    console.log('✅ DynamoDB connection successful!');
    console.log('📊 Found tables:', result.TableNames?.length || 0);
    
    if (result.TableNames && result.TableNames.length > 0) {
      console.log('\n🗂️ Available tables:');
      result.TableNames.forEach(tableName => {
        console.log(`   • ${tableName}`);
      });
      
      // Check if our required tables exist
      console.log('\n🎯 Checking required tables:');
      const requiredTables = [
        'pre-work-users-dev',
        'pre-work-profiles-dev', 
        'pre-work-submissions-dev',
        'pre-work-media-dev',
        'pre-work-audit-log-dev',
        'pre-work-teams-dev',
        'pre-work-assignments-dev',
        'pre-work-sessions-dev'
      ];
      
      requiredTables.forEach(tableName => {
        const exists = result.TableNames.includes(tableName);
        console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
      });
    } else {
      console.log('⚠️ No tables found in DynamoDB');
    }
  } catch (error) {
    console.error('❌ DynamoDB connection failed:', error.message);
    console.error('📋 Error details:', {
      code: error.$metadata?.httpStatusCode,
      name: error.name,
      requestId: error.$metadata?.requestId
    });
    
    if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDenied') {
      console.log('\n🔐 This appears to be a permissions issue.');
      console.log('💡 Your IAM user may need DynamoDB permissions.');
      console.log('   Required permissions: dynamodb:ListTables, dynamodb:DescribeTable');
    }
  }
}

testDynamoDBPermissions().catch(console.error);
