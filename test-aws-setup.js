#!/usr/bin/env node

/**
 * Quick AWS Integration Test
 * Tests the AWS configuration and environment setup
 */

console.log('🚀 Testing AWS Integration Setup...\n');

// Test 1: Environment Variables
console.log('1. Checking Environment Variables:');
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID', 
  'AWS_SECRET_ACCESS_KEY',
  'DYNAMODB_TABLE_PREFIX',
  'S3_BUCKET_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.log(`   ❌ Missing: ${missingVars.join(', ')}`);
  console.log('   💡 Copy .env.local.template to .env.local and add your AWS credentials\n');
} else {
  console.log('   ✅ All environment variables configured\n');
}

// Test 2: AWS SDK Configuration
console.log('2. Testing AWS SDK Configuration:');
try {
  const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
  const { S3Client } = require('@aws-sdk/client-s3');
  
  const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  console.log('   ✅ AWS SDK clients initialized successfully');
  console.log(`   📍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   🗃️  DynamoDB Prefix: ${process.env.DYNAMODB_TABLE_PREFIX || '[not set]'}`);
  console.log(`   🪣 S3 Bucket: ${process.env.S3_BUCKET_NAME || '[not set]'}\n`);
  
} catch (error) {
  console.log('   ❌ AWS SDK configuration error:', error.message);
  console.log('   💡 Run: npm install @aws-sdk/client-dynamodb @aws-sdk/client-s3\n');
}

// Test 3: Service Files
console.log('3. Checking Service Files:');
const serviceFiles = [
  'src/lib/aws/amplify.ts',
  'src/components/AWS/AmplifyProvider.tsx',
  'scripts/aws/setup-aws-resources.js',
  'scripts/aws/test-connection.js',
  '.env.aws.development',
  '.env.aws.production',
  '.env.local.template'
];

serviceFiles.forEach(file => {
  try {
    require('fs').accessSync(file);
    console.log(`   ✅ ${file}`);
  } catch {
    console.log(`   ❌ ${file} (missing)`);
  }
});

console.log('\n4. Next Steps:');
console.log('   1. Copy .env.local.template to .env.local');
console.log('   2. Add your AWS credentials to .env.local');
console.log('   3. Run: npm run aws:setup-dev');
console.log('   4. Run: npm run aws:test-connection');
console.log('   5. Start development: npm run dev\n');

console.log('📖 For detailed setup instructions: docs/AWS_INTEGRATION_GUIDE.md');
