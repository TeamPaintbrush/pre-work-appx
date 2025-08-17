require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variable Debug:\n');

console.log('Raw environment variables:');
console.log('DYNAMODB_USERS_TABLE:', process.env.DYNAMODB_USERS_TABLE || 'NOT SET');
console.log('DYNAMODB_PROFILES_TABLE:', process.env.DYNAMODB_PROFILES_TABLE || 'NOT SET');
console.log('DYNAMODB_TEAMS_TABLE:', process.env.DYNAMODB_TEAMS_TABLE || 'NOT SET');

const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'pre-work-users',
  PROFILES: process.env.DYNAMODB_PROFILES_TABLE || 'pre-work-profiles',
  TEAMS: process.env.DYNAMODB_TEAMS_TABLE || 'pre-work-teams',
};

console.log('\nComputed table names:');
console.log('TABLES.USERS:', TABLES.USERS);
console.log('TABLES.PROFILES:', TABLES.PROFILES);
console.log('TABLES.TEAMS:', TABLES.TEAMS);
