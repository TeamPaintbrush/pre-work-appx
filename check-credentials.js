// Quick AWS credential test
import { config } from 'dotenv';
config({ path: '.env.local' });

console.log('🔍 AWS Credentials Check:');
console.log('AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}***` : 'NOT SET');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? `${process.env.AWS_SECRET_ACCESS_KEY.length} characters` : 'NOT SET');
console.log('S3_MEDIA_BUCKET:', process.env.S3_MEDIA_BUCKET || 'NOT SET');
console.log('DYNAMODB_USERS_TABLE:', process.env.DYNAMODB_USERS_TABLE || 'NOT SET');
