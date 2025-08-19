// Test script to debug template loading issues
const path = require('path');

// Mock the types and dependencies
global.ChecklistTemplate = {};
global.TEMPLATE_CATEGORIES_MAP = {
  healthcare: { id: 'healthcare' },
  construction: { id: 'construction' },
  manufacturing: { id: 'manufacturing' },
  retail: { id: 'retail' },
  technology: { id: 'technology' },
  education: { id: 'education' },
  finance: { id: 'finance' },
  legal: { id: 'legal' },
  marketing: { id: 'marketing' },
  hr: { id: 'hr' }
};

async function testCategoryFile(category) {
  try {
    console.log(`\n🔍 Testing ${category} category...`);
    
    // Use dynamic import to test each file
    const filePath = `./src/data/templates/categories/${category}.ts`;
    
    // Read and analyze the file content
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count templates by looking for ID patterns
    const templateIds = content.match(/^\s*id:\s*'[a-zA-Z0-9-]+',/gm) || [];
    const mainTemplateIds = templateIds.filter(match => !match.includes('    ')); // Filter out nested IDs
    
    console.log(`📊 Template IDs found: ${templateIds.length}`);
    console.log(`📊 Main template IDs: ${mainTemplateIds.length}`);
    
    // Check for common syntax issues
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    
    console.log(`🔧 Braces: ${openBraces} open, ${closeBraces} close (${openBraces === closeBraces ? '✅' : '❌'})`);
    console.log(`🔧 Brackets: ${openBrackets} open, ${closeBrackets} close (${openBrackets === closeBrackets ? '✅' : '❌'})`);
    
    // Look for missing commas
    const templateSeparators = (content.match(/\}\s*,\s*\{/g) || []).length;
    console.log(`🔧 Template separators: ${templateSeparators}`);
    
    return {
      category,
      templateCount: mainTemplateIds.length,
      syntaxValid: openBraces === closeBraces && openBrackets === closeBrackets
    };
    
  } catch (error) {
    console.log(`❌ Error testing ${category}: ${error.message}`);
    return { category, error: error.message };
  }
}

async function main() {
  const categories = ['healthcare', 'construction', 'manufacturing', 'retail', 'technology', 'education', 'finance', 'legal', 'marketing', 'hr'];
  
  console.log('🧪 Testing all category template files...\n');
  
  const results = [];
  for (const category of categories) {
    const result = await testCategoryFile(category);
    results.push(result);
  }
  
  console.log('\n📋 Summary:');
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.category}: ERROR - ${result.error}`);
    } else {
      console.log(`${result.syntaxValid ? '✅' : '❌'} ${result.category}: ${result.templateCount} templates`);
    }
  });
}

main().catch(console.error);
