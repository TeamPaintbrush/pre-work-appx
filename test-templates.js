// Quick test to verify template counts
import { getTemplatesSummary, allTemplates } from './src/data/templates/expandedTemplates.js';

console.log('📊 Template Summary:');
console.log(getTemplatesSummary());

console.log('\n📋 Total Templates Available:', allTemplates.length);

// Check a few specific categories
const eventPrep = allTemplates.filter(t => t.category === 'Event Preparation');
const marketing = allTemplates.filter(t => t.category === 'Marketing');
const healthcare = allTemplates.filter(t => t.category === 'Healthcare');

console.log('\n🎯 Category Breakdown:');
console.log('Event Preparation:', eventPrep.length);
console.log('Marketing:', marketing.length);
console.log('Healthcare:', healthcare.length);
