// AWS Table Creation Helper
// This script helps you create the missing DynamoDB tables

console.log('📋 Missing DynamoDB Tables to Create:');
console.log('');
console.log('You need to create these additional tables in AWS Console:');
console.log('');

const missingTables = [
  {
    name: 'pre-work-teams-dev',
    description: 'For team collaboration features',
    partitionKey: 'PK (String)',
    sortKey: 'SK (String)',
    gsi: [
      'GSI1PK-GSI1SK-index (for organization queries)',
      'GSI2PK-GSI2SK-index (for user teams queries)'
    ]
  },
  {
    name: 'pre-work-assignments-dev', 
    description: 'For task assignments',
    partitionKey: 'PK (String)',
    sortKey: 'SK (String)',
    gsi: [
      'GSI1PK-GSI1SK-index (for user assignments)',
      'GSI2PK-GSI2SK-index (for team assignments)'
    ]
  },
  {
    name: 'pre-work-sessions-dev',
    description: 'For real-time collaboration',
    partitionKey: 'PK (String)', 
    sortKey: 'SK (String)',
    ttl: 'TTL (Number) - for automatic cleanup'
  }
];

missingTables.forEach((table, index) => {
  console.log(`${index + 1}. TABLE: ${table.name}`);
  console.log(`   Purpose: ${table.description}`);
  console.log(`   Partition Key: ${table.partitionKey}`);
  console.log(`   Sort Key: ${table.sortKey}`);
  if (table.gsi) {
    console.log(`   Global Secondary Indexes:`);
    table.gsi.forEach(gsi => console.log(`     - ${gsi}`));
  }
  if (table.ttl) {
    console.log(`   TTL: ${table.ttl}`);
  }
  console.log('');
});

console.log('🔧 How to create these tables:');
console.log('1. Go to AWS DynamoDB Console');
console.log('2. Click "Create table"');
console.log('3. Use the table specifications above');
console.log('4. Enable "On-demand" billing mode');
console.log('5. Add the Global Secondary Indexes after table creation');
console.log('');
console.log('🚀 After creating all tables, run: npm run test:aws');
