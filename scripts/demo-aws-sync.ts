/**
 * TEMPLATE AWS SYNC DEMONSTRATION
 * Shows how templates would be synced to AWS (mock mode for demo)
 * Run with: npx tsx scripts/demo-aws-sync.ts
 */

import { ALL_EXPANDED_TEMPLATES, TEMPLATE_COUNT_SUMMARY } from '../src/data/templates/expandedTemplates';
import { ChecklistTemplate } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

interface MockSyncResult {
  templates: Array<{
    id: string;
    name: string;
    category: string;
    size: number;
    awsKey: string;
    status: 'synced' | 'pending' | 'error';
    timestamp: string;
  }>;
  summary: {
    total: number;
    synced: number;
    pending: number;
    errors: number;
    totalSize: number;
  };
}

function mockAWSTemplateService() {
  return {
    async saveTemplate(template: ChecklistTemplate, userId: string = 'system') {
      // Simulate AWS DynamoDB save operation
      const delay = Math.random() * 1000 + 500; // 500-1500ms delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simulate occasional failures (5% error rate)
      if (Math.random() < 0.05) {
        throw new Error(`AWS Service Error: Rate limit exceeded for template ${template.id}`);
      }
      
      return {
        success: true,
        awsKey: `templates/${template.category}/${template.id}`,
        version: template.version || '1.0.0',
        timestamp: new Date().toISOString()
      };
    },
    
    async listTemplates() {
      // Simulate AWS DynamoDB scan operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return ALL_EXPANDED_TEMPLATES.map(t => ({
        id: t.id,
        name: t.name,
        category: typeof t.category === 'string' ? t.category : t.category?.name || 'General'
      }));
    }
  };
}

async function demonstrateAWSSync(): Promise<MockSyncResult> {
  console.log('🚀 AWS Template Sync Demonstration');
  console.log('==================================\n');
  
  console.log('📊 Template Count Summary:', TEMPLATE_COUNT_SUMMARY);
  console.log(`📋 Total templates to sync: ${ALL_EXPANDED_TEMPLATES.length}\n`);
  
  const awsService = mockAWSTemplateService();
  const result: MockSyncResult = {
    templates: [],
    summary: {
      total: ALL_EXPANDED_TEMPLATES.length,
      synced: 0,
      pending: 0,
      errors: 0,
      totalSize: 0
    }
  };

  console.log('💾 Starting mock AWS sync process...\n');
  
  // Process templates in batches
  const batchSize = 5;
  let processedCount = 0;
  
  for (let i = 0; i < ALL_EXPANDED_TEMPLATES.length; i += batchSize) {
    const batch = ALL_EXPANDED_TEMPLATES.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ALL_EXPANDED_TEMPLATES.length / batchSize)} (${batch.length} templates)`);
    
    const batchPromises = batch.map(async (template: ChecklistTemplate) => {
      const templateSize = JSON.stringify(template).length;
      result.summary.totalSize += templateSize;
      
      try {
        const syncResult = await awsService.saveTemplate(template);
        
        processedCount++;
        const categoryName = typeof template.category === 'string' ? template.category : template.category?.name || 'General';
        console.log(`  ✅ ${processedCount}/${result.summary.total} - ${template.name} (${categoryName})`);
        
        result.templates.push({
          id: template.id,
          name: template.name,
          category: categoryName,
          size: templateSize,
          awsKey: syncResult.awsKey,
          status: 'synced',
          timestamp: syncResult.timestamp
        });
        
        result.summary.synced++;
        
      } catch (error) {
        processedCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        const categoryName = typeof template.category === 'string' ? template.category : template.category?.name || 'General';
        console.log(`  ❌ ${processedCount}/${result.summary.total} - ${template.name} (${categoryName}) - ${errorMsg}`);
        
        result.templates.push({
          id: template.id,
          name: template.name,
          category: categoryName,
          size: templateSize,
          awsKey: `error/${template.id}`,
          status: 'error',
          timestamp: new Date().toISOString()
        });
        
        result.summary.errors++;
      }
    });
    
    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + batchSize < ALL_EXPANDED_TEMPLATES.length) {
      console.log('  ⏱️  Waiting for next batch...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return result;
}

function generateSyncSummary(result: MockSyncResult): void {
  console.log('\n🎉 AWS Sync Demonstration Complete!');
  console.log('=====================================');
  console.log(`✅ Successfully synced: ${result.summary.synced} templates`);
  console.log(`❌ Failed to sync: ${result.summary.errors} templates`);
  console.log(`📏 Success rate: ${((result.summary.synced / result.summary.total) * 100).toFixed(1)}%`);
  console.log(`💾 Total data size: ${Math.round(result.summary.totalSize / 1024)} KB`);
  
  // Category breakdown
  const categories = new Map<string, { synced: number; errors: number }>();
  result.templates.forEach(template => {
    if (!categories.has(template.category)) {
      categories.set(template.category, { synced: 0, errors: 0 });
    }
    const cat = categories.get(template.category)!;
    if (template.status === 'synced') {
      cat.synced++;
    } else if (template.status === 'error') {
      cat.errors++;
    }
  });
  
  console.log('\n📂 CATEGORY SYNC STATUS:');
  categories.forEach((stats, category) => {
    const total = stats.synced + stats.errors;
    const rate = total > 0 ? ((stats.synced / total) * 100).toFixed(1) : '0.0';
    console.log(`  ${category}: ${stats.synced}/${total} synced (${rate}%)`);
  });
  
  if (result.summary.errors > 0) {
    console.log('\n❌ FAILED TEMPLATES:');
    result.templates
      .filter(t => t.status === 'error')
      .forEach(template => {
        console.log(`  - ${template.name} (${template.category})`);
      });
  }
}

async function saveAWSSyncReport(result: MockSyncResult): Promise<void> {
  const reportData = {
    demonstration: true,
    timestamp: new Date().toISOString(),
    summary: result.summary,
    templateCounts: TEMPLATE_COUNT_SUMMARY,
    syncDetails: result.templates,
    awsConfig: {
      region: 'us-east-1',
      tableName: 'PreWorkApp-Templates',
      metadataTable: 'PreWorkApp-Templates-Metadata',
      note: 'This is a demonstration - no actual AWS resources were used'
    }
  };
  
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `aws-sync-demo-${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
  console.log(`\n💾 AWS Sync report saved to: ${filepath}`);
}

async function main() {
  try {
    const result = await demonstrateAWSSync();
    generateSyncSummary(result);
    await saveAWSSyncReport(result);
    
    console.log('\n💡 NEXT STEPS FOR REAL AWS SYNC:');
    console.log('1. Set up AWS credentials in .env file');
    console.log('2. Configure DynamoDB tables');
    console.log('3. Run: npx tsx scripts/save-templates-to-aws.ts');
    console.log('4. Verify templates in AWS console');
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  main();
}

export { demonstrateAWSSync };
