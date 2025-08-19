import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

// AWS Configuration
const awsConfig = {
  region: process.env.REGION || process.env.NEXT_PUBLIC_REGION || process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

// DynamoDB Client for user data
export const dynamoDBClient = new DynamoDBClient(awsConfig);
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// S3 Client for media storage
export const s3Client = new S3Client(awsConfig);

// Database table names
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'pre-work-users',
  PROFILES: process.env.DYNAMODB_PROFILES_TABLE || 'pre-work-profiles',
  SUBMISSIONS: process.env.DYNAMODB_SUBMISSIONS_TABLE || 'pre-work-submissions',
  MEDIA: process.env.DYNAMODB_MEDIA_TABLE || 'pre-work-media',
  AUDIT_LOG: process.env.DYNAMODB_AUDIT_TABLE || 'pre-work-audit-log',
  TEAMS: process.env.DYNAMODB_TEAMS_TABLE || 'pre-work-teams',
  ASSIGNMENTS: process.env.DYNAMODB_ASSIGNMENTS_TABLE || 'pre-work-assignments',
  SESSIONS: process.env.DYNAMODB_SESSIONS_TABLE || 'pre-work-sessions',
} as const;

// S3 bucket configuration
export const S3_BUCKETS = {
  MEDIA: process.env.S3_MEDIA_BUCKET || 'pre-work-media-uploads',
  THUMBNAILS: process.env.S3_THUMBNAILS_BUCKET || 'pre-work-thumbnails',
  DOCUMENTS: process.env.S3_DOCUMENTS_BUCKET || 'pre-work-documents',
} as const;

// Environment validation
export function validateAwsConfig() {
  const required = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required AWS environment variables: ${missing.join(', ')}`);
  }
}

// Connection test utility
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    validateAwsConfig();
    // Simple test to verify DynamoDB connection
    const testCommand = new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId: 'test-connection' },
    });
    // This will throw if connection fails
    await docClient.send(testCommand);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
