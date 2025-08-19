#!/usr/bin/env node

/**
 * AWS Connection Test Script
 * Tests connectivity to AWS services and validates configuration
 */

const AWS = require('aws-sdk');
require('dotenv').config({ path: '.env.local' });

// Configuration
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || 'us-east-1';

console.log('🔍 Testing AWS Connection...');
console.log(`📍 Region: ${REGION}`);
console.log(`🔑 Access Key ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Configured' : '❌ Missing'}`);
console.log(`🔐 Secret Access Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Configured' : '❌ Missing'}`);

// Initialize AWS SDK
AWS.config.update({ region: REGION });

async function testAWSConnection() {
  const results = [];
  
  // Test STS (Security Token Service) - Basic AWS connectivity
  try {
    console.log('\n🧪 Testing AWS STS (Basic Connectivity)...');
    const sts = new AWS.STS();
    const identity = await sts.getCallerIdentity().promise();
    console.log(`✅ STS Connection successful`);
    console.log(`   Account: ${identity.Account}`);
    console.log(`   User ARN: ${identity.Arn}`);
    results.push({ service: 'STS', status: 'success', details: identity });
  } catch (error) {
    console.log(`❌ STS Connection failed: ${error.message}`);
    results.push({ service: 'STS', status: 'error', error: error.message });
  }
  
  // Test DynamoDB
  try {
    console.log('\n🧪 Testing DynamoDB...');
    const dynamodb = new AWS.DynamoDB();
    const tables = await dynamodb.listTables().promise();
    console.log(`✅ DynamoDB Connection successful`);
    console.log(`   Available tables: ${tables.TableNames.length}`);
    
    // Check for our specific tables
    const ourTables = tables.TableNames.filter(name => name.includes('PreWorkApp'));
    if (ourTables.length > 0) {
      console.log(`   PreWorkApp tables found: ${ourTables.join(', ')}`);
    } else {
      console.log(`   ⚠️  No PreWorkApp tables found. Run 'npm run aws:setup-dev' to create them.`);
    }
    results.push({ service: 'DynamoDB', status: 'success', tables: ourTables });
  } catch (error) {
    console.log(`❌ DynamoDB Connection failed: ${error.message}`);
    results.push({ service: 'DynamoDB', status: 'error', error: error.message });
  }
  
  // Test S3
  try {
    console.log('\n🧪 Testing S3...');
    const s3 = new AWS.S3();
    const buckets = await s3.listBuckets().promise();
    console.log(`✅ S3 Connection successful`);
    console.log(`   Available buckets: ${buckets.Buckets.length}`);
    
    // Check for our specific buckets
    const ourBuckets = buckets.Buckets.filter(bucket => bucket.Name.includes('preworkapp'));
    if (ourBuckets.length > 0) {
      console.log(`   PreWorkApp buckets found: ${ourBuckets.map(b => b.Name).join(', ')}`);
    } else {
      console.log(`   ⚠️  No PreWorkApp buckets found. Run 'npm run aws:setup-dev' to create them.`);
    }
    results.push({ service: 'S3', status: 'success', buckets: ourBuckets.map(b => b.Name) });
  } catch (error) {
    console.log(`❌ S3 Connection failed: ${error.message}`);
    results.push({ service: 'S3', status: 'error', error: error.message });
  }
  
  // Test specific table access (if tables exist)
  const templatesTable = process.env.NEXT_PUBLIC_DYNAMODB_TEMPLATES_TABLE;
  if (templatesTable) {
    try {
      console.log(`\n🧪 Testing DynamoDB Table Access (${templatesTable})...`);
      const dynamodb = new AWS.DynamoDB();
      const tableDesc = await dynamodb.describeTable({ TableName: templatesTable }).promise();
      console.log(`✅ Table ${templatesTable} accessible`);
      console.log(`   Status: ${tableDesc.Table.TableStatus}`);
      console.log(`   Items: ${tableDesc.Table.ItemCount || 0}`);
      results.push({ service: 'DynamoDB Table', status: 'success', table: templatesTable });
    } catch (error) {
      console.log(`❌ Table ${templatesTable} access failed: ${error.message}`);
      results.push({ service: 'DynamoDB Table', status: 'error', error: error.message });
    }
  }
  
  // Test S3 bucket access (if buckets exist)
  const storageBucket = process.env.NEXT_PUBLIC_S3_BUCKET;
  if (storageBucket) {
    try {
      console.log(`\n🧪 Testing S3 Bucket Access (${storageBucket})...`);
      const s3 = new AWS.S3();
      await s3.headBucket({ Bucket: storageBucket }).promise();
      console.log(`✅ Bucket ${storageBucket} accessible`);
      results.push({ service: 'S3 Bucket', status: 'success', bucket: storageBucket });
    } catch (error) {
      console.log(`❌ Bucket ${storageBucket} access failed: ${error.message}`);
      results.push({ service: 'S3 Bucket', status: 'error', error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 All AWS services are properly configured and accessible!');
    console.log('✅ Your app is ready to use AWS features.');
  } else {
    console.log('\n⚠️  Some AWS services are not accessible.');
    console.log('📝 Recommended actions:');
    console.log('1. Verify AWS credentials in .env.local');
    console.log('2. Check IAM permissions for your AWS user');
    console.log('3. Run "npm run aws:setup-dev" to create missing resources');
    console.log('4. Ensure your AWS region is correct');
  }
  
  // Environment variables check
  console.log('\n🔧 Environment Variables Check:');
  const requiredVars = [
    'NEXT_PUBLIC_AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'NEXT_PUBLIC_DYNAMODB_TEMPLATES_TABLE',
    'NEXT_PUBLIC_S3_BUCKET'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${varName}: ${value ? '✅' : '❌'} ${value ? '(configured)' : '(missing)'}`);
  });
  
  return { success: errorCount === 0, results };
}

// Feature flags test
function testFeatureFlags() {
  console.log('\n🏳️  Feature Flags Status:');
  const flags = [
    'NEXT_PUBLIC_ENABLE_AWS_FEATURES',
    'NEXT_PUBLIC_ENABLE_REAL_TIME_SYNC',
    'NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS',
    'NEXT_PUBLIC_ENABLE_AI_FEATURES',
    'NEXT_PUBLIC_ENABLE_INTEGRATION_HUB'
  ];
  
  flags.forEach(flag => {
    const value = process.env[flag];
    const enabled = value === 'true';
    console.log(`   ${flag}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
  });
}

// Mock data test
function testMockFallback() {
  console.log('\n🎭 Mock Data Fallback:');
  const useMock = process.env.USE_MOCK_AWS_SERVICES === 'true';
  console.log(`   Mock services: ${useMock ? '✅ Enabled' : '❌ Disabled'}`);
  
  if (useMock) {
    console.log('   📝 Note: App will use mock data when AWS is unavailable');
  }
}

// Run all tests
async function runAllTests() {
  try {
    const result = await testAWSConnection();
    testFeatureFlags();
    testMockFallback();
    
    console.log('\n🏁 Testing complete!');
    
    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  }
}

runAllTests();
