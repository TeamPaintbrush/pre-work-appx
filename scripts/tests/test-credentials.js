// Simple AWS credential test
import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

config({ path: '.env.local' });

console.log('🔐 Testing AWS Credentials...\n');

// Test S3 credentials
console.log('1️⃣ Testing S3 Client Creation:');
try {
  const s3Client = new S3Client({ 
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  console.log('✅ S3 Client created successfully');
} catch (error) {
  console.log('❌ S3 Client failed:', error.message);
}

// Test DynamoDB credentials
console.log('\n2️⃣ Testing DynamoDB Client Creation:');
try {
  const dynamoClient = new DynamoDBClient({ 
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  console.log('✅ DynamoDB Client created successfully');
} catch (error) {
  console.log('❌ DynamoDB Client failed:', error.message);
}

console.log('\n🔍 Environment Check:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
