#!/usr/bin/env node
/**
 * AWS Integration Test Script
 * Comprehensive testing of all AWS services and enterprise features
 */

import { config } from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { validateAwsConfig, TABLES } from '../../src/lib/database/config';
import * as path from 'path';

// Load environment variables first
config({ path: '.env.local' });

// Create fresh AWS clients with explicit credentials
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class AWSIntegrationTest {
  private results: TestResult[] = [];

  private log(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration?: number) {
    this.results.push({ test, status, message, duration });
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`${statusIcon} ${test}: ${message}${durationText}`);
  }

  async testEnvironmentVariables(): Promise<void> {
    const start = Date.now();
    try {
      validateAwsConfig();
      
      const required = [
        'AWS_REGION',
        'AWS_ACCESS_KEY_ID', 
        'AWS_SECRET_ACCESS_KEY',
        'DYNAMODB_USERS_TABLE',
        'DYNAMODB_PROFILES_TABLE',
        'DYNAMODB_TEAMS_TABLE',
        'DYNAMODB_ASSIGNMENTS_TABLE',
        'DYNAMODB_SESSIONS_TABLE',
        'S3_MEDIA_BUCKET'
      ];

      const missing = required.filter(key => !process.env[key]);
      
      if (missing.length > 0) {
        this.log(
          'Environment Variables',
          'FAIL',
          `Missing variables: ${missing.join(', ')}`
        );
        return;
      }

      this.log(
        'Environment Variables', 
        'PASS', 
        'All required environment variables are set',
        Date.now() - start
      );
    } catch (error) {
      this.log(
        'Environment Variables',
        'FAIL', 
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - start
      );
    }
  }

  async testDynamoDBConnection(): Promise<boolean> {
    const start = Date.now();
    const testTable = 'pre-work-users-dev';
    try {
      // Test connection by trying to describe a table that exists
      await docClient.send(new GetCommand({
        TableName: testTable,
        Key: { id: 'test-connection-check' }
      }));

      this.log(
        'DynamoDB Connection',
        'PASS',
        `Successfully connected to DynamoDB in ${process.env.AWS_REGION}`,
        Date.now() - start
      );
      return true;
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        this.log(
          'DynamoDB Connection',
          'FAIL',
          `Table ${testTable} not found. Please create your DynamoDB tables first.`,
          Date.now() - start
        );
      } else {
        this.log(
          'DynamoDB Connection',
          'FAIL',
          `Connection failed: ${error.message}`,
          Date.now() - start
        );
      }
      return false;
    }
  }

  async testS3Connection(): Promise<boolean> {
    const start = Date.now();
    try {
      const s3Client = new S3Client({ region: process.env.AWS_REGION });
      const bucketName = process.env.S3_MEDIA_BUCKET;
      
      if (!bucketName) {
        this.log(
          'S3 Connection',
          'FAIL',
          'S3_MEDIA_BUCKET environment variable not set',
          Date.now() - start
        );
        return false;
      }
      
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));

      this.log(
        'S3 Connection',
        'PASS',
        `Successfully connected to S3 bucket: ${bucketName}`,
        Date.now() - start
      );
      return true;
    } catch (error: any) {
      this.log(
        'S3 Connection',
        'FAIL',
        `S3 connection failed: ${error.message}`,
        Date.now() - start
      );
      return false;
    }
  }

  async testBasicDynamoDBOperations(): Promise<void> {
    const start = Date.now();
    try {
      // Step 1: Test read operation on users table (this won't fail if record doesn't exist)
      const testId = `test-${Date.now()}`;
      const getUserResult = await docClient.send(new GetCommand({
        TableName: 'pre-work-users-dev',
        Key: { id: testId }
      }));
      
      // Step 2: Test write operation - create a test user
      const testUser = {
        id: testId,
        email: `test-${testId}@example.com`,
        name: 'Test User',
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      await docClient.send(new PutCommand({
        TableName: 'pre-work-users-dev',
        Item: testUser
      }));
      
      // Step 3: Test read to verify the write worked
      const verifyResult = await docClient.send(new GetCommand({
        TableName: 'pre-work-users-dev',
        Key: { id: testId }
      }));
      
      if (!verifyResult.Item) {
        throw new Error('Failed to retrieve created test user');
      }
      
      // Step 4: Clean up - delete the test user
      await docClient.send(new DeleteCommand({
        TableName: 'pre-work-users-dev',
        Key: { id: testId }
      }));

      this.log(
        'DynamoDB Operations',
        'PASS',
        'Basic DynamoDB CRUD operations successful (Create, Read, Delete)',
        Date.now() - start
      );
    } catch (error: any) {
      this.log(
        'DynamoDB Operations',
        'FAIL',
        `DynamoDB operations failed: ${error.message}`,
        Date.now() - start
      );
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting AWS Integration Tests...\n');

    // Core infrastructure tests
    await this.testEnvironmentVariables();
    const dbConnected = await this.testDynamoDBConnection();
    const s3Connected = await this.testS3Connection();

    // Application tests (only if infrastructure is working)
    if (dbConnected) {
      await this.testBasicDynamoDBOperations();
    } else {
      this.log('DynamoDB Operations', 'SKIP', 'Skipped due to DynamoDB connection failure');
    }

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    console.log('\n' + '='.repeat(60));
    console.log('🧪 AWS INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📊 Total: ${this.results.length}`);

    if (failed === 0 && passed > 0) {
      console.log('\n🎉 ALL TESTS PASSED! Your AWS integration is working perfectly!');
      console.log('\n🚀 Ready to run:');
      console.log('   • npm run dev - Start your development server');
      console.log('   • Test enterprise features in your browser');
      console.log('   • Create teams and collaborate in real-time');
      console.log('   • Upload files directly to S3');
    } else if (failed > 0) {
      console.log('\n⚠️ Some tests failed. Please check the errors above.');
      console.log('\n🔧 Common fixes:');
      
      const failedTests = this.results.filter(r => r.status === 'FAIL').map(r => r.test);
      
      if (failedTests.includes('Environment Variables')) {
        console.log('   • Check your .env.local file for missing variables');
      }
      if (failedTests.includes('DynamoDB Connection')) {
        console.log('   • Create DynamoDB tables in AWS Console');
        console.log('   • Verify table names match environment variables');
        console.log('   • Check AWS credentials and permissions');
      }
      if (failedTests.includes('S3 Connection')) {
        console.log('   • Create S3 buckets in AWS Console');
        console.log('   • Verify bucket names and regions');
        console.log('   • Check S3 permissions');
      }
    } else {
      console.log('\n⚠️ No tests were completed successfully. Please check your AWS setup.');
    }

    console.log('\n📖 Documentation:');
    console.log('   • docs/AWS_INTEGRATION_ARCHITECTURE.md - Complete setup guide');
    console.log('   • docs/AWS_TESTING_GUIDE.md - Testing and usage examples');
    console.log('   • docs/IMPLEMENTATION_COMPLETE.md - Feature overview');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new AWSIntegrationTest();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}
