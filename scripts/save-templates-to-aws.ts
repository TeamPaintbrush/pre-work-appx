/**
 * TEMPLATE SYNC TO AWS SCRIPT
 * Saves all templates from local category files to AWS DynamoDB storage
 * Run with: npx ts-node scripts/save-templates-to-aws.ts
 */

import { config } from 'dotenv';
import { AWSTemplateService } from '../src/services/aws/AWSTemplateService';
import { ALL_EXPANDED_TEMPLATES, TEMPLATE_COUNT_SUMMARY } from '../src/data/templates/expandedTemplates';
import { ChecklistTemplate } from '../src/types';

// Load environment variables
config();

interface SyncResult {
  success: number;
  failed: number;
  errors: string[];
  totalTemplates: number;
}

async function saveAllTemplatesToAWS(): Promise<SyncResult> {
  console.log('🚀 Starting AWS Template Sync...');
  console.log('📊 Template Count Summary:', TEMPLATE_COUNT_SUMMARY);
  
  const result: SyncResult = {
    success: 0,
    failed: 0,
    errors: [],
    totalTemplates: ALL_EXPANDED_TEMPLATES.length
  };

  try {
    // Initialize AWS Template Service
    const awsService = new AWSTemplateService({
      enableRealTimeSync: true,
      enableVersioning: true,
      enableCollaboration: false,
      cacheTimeout: 300000 // 5 minutes
    });

    console.log(`\n📋 Total templates to sync: ${result.totalTemplates}`);
    console.log('💾 Syncing templates to AWS DynamoDB...\n');

    // Process templates in batches to avoid overwhelming AWS
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < ALL_EXPANDED_TEMPLATES.length; i += batchSize) {
      batches.push(ALL_EXPANDED_TEMPLATES.slice(i, i + batchSize));
    }

    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} templates)`);
      
      const batchPromises = batch.map(async (template: ChecklistTemplate) => {
        try {
          // Ensure template has required fields for AWS
          const templateForAWS: ChecklistTemplate = {
            ...template,
            // Add metadata if missing
            createdBy: template.createdBy || 'system',
            version: template.version || '1.0.0',
            lastModified: template.lastModified || new Date(),
            isBuiltIn: template.isBuiltIn !== undefined ? template.isBuiltIn : true,
            // Ensure category is properly set
            category: template.category || ({ id: 'general', name: 'General', description: 'General templates', isActive: true } as any)
          };

          await awsService.saveTemplate(templateForAWS, 'system');
          
          processedCount++;
          console.log(`  ✅ ${processedCount}/${result.totalTemplates} - ${template.name} (${typeof template.category === 'string' ? template.category : template.category?.name || 'Unknown'})`);
          result.success++;
          
        } catch (error) {
          const errorMsg = `Failed to save template "${template.name}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`  ❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          result.failed++;
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Add small delay between batches to be respectful to AWS
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n🎉 AWS Template Sync Complete!');
    console.log(`✅ Successfully synced: ${result.success} templates`);
    console.log(`❌ Failed to sync: ${result.failed} templates`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Verify sync by getting a sample template
    if (result.success > 0) {
      console.log('\n🔍 Verification: Testing template retrieval...');
      try {
        const firstTemplate = ALL_EXPANDED_TEMPLATES[0];
        const retrieved = await awsService.getTemplate(firstTemplate.id);
        if (retrieved) {
          console.log(`✅ Verification successful: Retrieved "${retrieved.name}"`);
        } else {
          console.log('⚠️  Verification warning: Could not retrieve sample template');
        }
      } catch (error) {
        console.log(`⚠️  Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

  } catch (error) {
    console.error('💥 Critical error during sync:', error);
    result.errors.push(`Critical sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

// Check environment variables
function checkEnvironment(): boolean {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(env => console.error(`  - ${env}`));
    console.error('\n💡 Please set these in your .env file');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  return true;
}

// Main execution
async function main() {
  console.log('🔧 AWS Template Sync Tool');
  console.log('==========================\n');
  
  if (!checkEnvironment()) {
    process.exit(1);
  }

  try {
    const result = await saveAllTemplatesToAWS();
    
    console.log('\n📊 Final Summary:');
    console.log(`  Total templates: ${result.totalTemplates}`);
    console.log(`  Successfully synced: ${result.success}`);
    console.log(`  Failed to sync: ${result.failed}`);
    console.log(`  Success rate: ${((result.success / result.totalTemplates) * 100).toFixed(1)}%`);
    
    process.exit(result.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { saveAllTemplatesToAWS };
