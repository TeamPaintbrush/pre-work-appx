// Debug script to check template counts
const { HEALTHCARE_TEMPLATES } = require('./src/data/templates/categories/healthcare.ts');

console.log('Healthcare Templates Count:', HEALTHCARE_TEMPLATES.length);
console.log('First 5 template IDs:', HEALTHCARE_TEMPLATES.slice(0, 5).map(t => t.id));
console.log('Last 5 template IDs:', HEALTHCARE_TEMPLATES.slice(-5).map(t => t.id));
