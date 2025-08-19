/**
 * TEMPLATE VALIDATION AND PREPARATION SCRIPT
 * Validates all templates and prepares them for AWS sync
 * Run with: npx ts-node scripts/validate-templates.ts
 */

import { ALL_EXPANDED_TEMPLATES, TEMPLATE_COUNT_SUMMARY } from '../src/data/templates/expandedTemplates';
import { ChecklistTemplate } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: number;
  invalid: number;
  warnings: string[];
  errors: string[];
  templateData: PreparedTemplate[];
}

interface PreparedTemplate {
  id: string;
  name: string;
  category: string;
  isValid: boolean;
  size: number;
  sections: number;
  metadata: {
    version: string;
    createdBy: string;
    lastModified: string;
    isBuiltIn: boolean;
  };
}

function validateTemplate(template: ChecklistTemplate): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check required fields
  if (!template.id) issues.push('Missing ID');
  if (!template.name) issues.push('Missing name');
  if (!template.description) issues.push('Missing description');
  if (!template.category) issues.push('Missing category');
  if (!template.sections || template.sections.length === 0) issues.push('No sections defined');
  
  // Check data types
  if (template.id && typeof template.id !== 'string') issues.push('ID must be string');
  if (template.name && typeof template.name !== 'string') issues.push('Name must be string');
  if (template.tags && !Array.isArray(template.tags)) issues.push('Tags must be array');
  
  // Check sections structure
  if (template.sections) {
    template.sections.forEach((section, index) => {
      if (!section.id) issues.push(`Section ${index + 1} missing ID`);
      if (!section.title) issues.push(`Section ${index + 1} missing title`);
      if (!section.items || section.items.length === 0) issues.push(`Section ${index + 1} has no items`);
    });
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

function prepareTemplateForAWS(template: ChecklistTemplate): PreparedTemplate {
  const validation = validateTemplate(template);
  
  return {
    id: template.id || `template-${Date.now()}`,
    name: template.name || 'Unnamed Template',
    category: typeof template.category === 'string' ? template.category : template.category?.name || 'General',
    isValid: validation.isValid,
    size: JSON.stringify(template).length,
    sections: template.sections?.length || 0,
    metadata: {
      version: template.version || '1.0.0',
      createdBy: template.createdBy || 'system',
      lastModified: template.lastModified ? new Date(template.lastModified).toISOString() : new Date().toISOString(),
      isBuiltIn: template.isBuiltIn !== undefined ? template.isBuiltIn : true
    }
  };
}

async function validateAllTemplates(): Promise<ValidationResult> {
  console.log('🔍 Validating All Templates...');
  console.log('📊 Template Count Summary:', TEMPLATE_COUNT_SUMMARY);
  
  const result: ValidationResult = {
    valid: 0,
    invalid: 0,
    warnings: [],
    errors: [],
    templateData: []
  };

  console.log(`\n📋 Processing ${ALL_EXPANDED_TEMPLATES.length} templates...\n`);

  ALL_EXPANDED_TEMPLATES.forEach((template, index) => {
    const validation = validateTemplate(template);
    const prepared = prepareTemplateForAWS(template);
    
    result.templateData.push(prepared);
    
    if (validation.isValid) {
      result.valid++;
      console.log(`✅ ${index + 1}/${ALL_EXPANDED_TEMPLATES.length} - ${template.name} (${prepared.category}) - ${prepared.sections} sections`);
    } else {
      result.invalid++;
      console.log(`❌ ${index + 1}/${ALL_EXPANDED_TEMPLATES.length} - ${template.name} (${prepared.category}) - INVALID`);
      validation.issues.forEach(issue => {
        const error = `Template "${template.name}": ${issue}`;
        console.log(`   ⚠️  ${issue}`);
        result.errors.push(error);
      });
    }
    
    // Check for warnings
    if (prepared.size > 50000) {
      const warning = `Template "${template.name}" is large (${Math.round(prepared.size / 1024)}KB)`;
      result.warnings.push(warning);
    }
    
    if (prepared.sections > 20) {
      const warning = `Template "${template.name}" has many sections (${prepared.sections})`;
      result.warnings.push(warning);
    }
  });

  return result;
}

function generateSyncReport(result: ValidationResult): void {
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('=====================');
  console.log(`✅ Valid templates: ${result.valid}`);
  console.log(`❌ Invalid templates: ${result.invalid}`);
  console.log(`⚠️  Warnings: ${result.warnings.length}`);
  console.log(`🚫 Errors: ${result.errors.length}`);
  console.log(`📏 Success rate: ${((result.valid / ALL_EXPANDED_TEMPLATES.length) * 100).toFixed(1)}%`);
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (result.errors.length > 0) {
    console.log('\n🚫 ERRORS:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Category breakdown
  const categories = new Map<string, { valid: number; invalid: number }>();
  result.templateData.forEach(template => {
    if (!categories.has(template.category)) {
      categories.set(template.category, { valid: 0, invalid: 0 });
    }
    const cat = categories.get(template.category)!;
    if (template.isValid) {
      cat.valid++;
    } else {
      cat.invalid++;
    }
  });
  
  console.log('\n📂 CATEGORY BREAKDOWN:');
  categories.forEach((stats, category) => {
    const total = stats.valid + stats.invalid;
    const rate = ((stats.valid / total) * 100).toFixed(1);
    console.log(`  ${category}: ${stats.valid}/${total} valid (${rate}%)`);
  });
}

async function saveReport(result: ValidationResult): Promise<void> {
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTemplates: ALL_EXPANDED_TEMPLATES.length,
      validTemplates: result.valid,
      invalidTemplates: result.invalid,
      warningCount: result.warnings.length,
      errorCount: result.errors.length,
      successRate: ((result.valid / ALL_EXPANDED_TEMPLATES.length) * 100).toFixed(1) + '%'
    },
    templateCounts: TEMPLATE_COUNT_SUMMARY,
    warnings: result.warnings,
    errors: result.errors,
    templates: result.templateData
  };
  
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `template-validation-${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Report saved to: ${filepath}`);
}

// Main execution
async function main() {
  console.log('🔧 Template Validation Tool');
  console.log('============================\n');
  
  try {
    const result = await validateAllTemplates();
    generateSyncReport(result);
    await saveReport(result);
    
    if (result.valid === ALL_EXPANDED_TEMPLATES.length) {
      console.log('\n🎉 All templates are valid and ready for AWS sync!');
      console.log('💡 Next step: Run the AWS sync script with proper credentials');
    } else {
      console.log('\n⚠️  Some templates need attention before AWS sync');
      console.log('💡 Fix the errors above and run validation again');
    }
    
    process.exit(result.invalid > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { validateAllTemplates };
