/**
 * Seed default invoice templates for CompanyCam
 *
 * Run: npm run seed
 */

import { initDb } from './lib/db.js';
import { InvoiceService } from './services/invoice.service.js';
import { logger } from './lib/logger.js';

// Initialize the database
initDb();

// Check if templates already exist
const existing = InvoiceService.getTemplates('CompanyCam');
if (existing.length > 0) {
  logger.info('Templates already exist', { count: existing.length });
  process.exit(0);
}

// Create default CompanyCam templates
const templates = [
  {
    clientName: 'CompanyCam',
    description: 'Weekly development fee',
    unitPrice: 380000, // $3,800
    isDefault: true,
  },
  {
    clientName: 'CompanyCam',
    description: 'Claude Code Max subscription',
    unitPrice: 20000, // $200
    isDefault: false,
  },
  {
    clientName: 'CompanyCam',
    description: 'Windsurf Pro subscription',
    unitPrice: 5000, // $50
    isDefault: false,
  },
  {
    clientName: 'CompanyCam',
    description: 'Anthropic API charges',
    unitPrice: 0, // Variable - edit when adding
    isDefault: false,
  },
];

for (const template of templates) {
  InvoiceService.createTemplate(template);
}

logger.info('Templates seeded', { count: templates.length });
console.log('\nDefault templates created for CompanyCam:');
console.log('  - Weekly development fee ($3,800) [default]');
console.log('  - Claude Code Max subscription ($200)');
console.log('  - Windsurf Pro subscription ($50)');
console.log('  - Anthropic API charges (variable)');
