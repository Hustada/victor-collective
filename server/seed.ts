/**
 * Seed default invoice templates for CompanyCam
 *
 * Run: npm run seed
 */

import { initDb } from './lib/db.js';
import { InvoiceService } from './services/invoice.service.js';
import { ClientService } from './services/client.service.js';
import { logger } from './lib/logger.js';

// Initialize the database (seeds the CompanyCam registry client)
initDb();

const companyCam = ClientService.list().find((c) => c.name === 'CompanyCam');
if (!companyCam) {
  logger.error('CompanyCam client not found in registry; cannot seed templates');
  process.exit(1);
}

// Check if templates already exist
const existing = InvoiceService.getTemplates(companyCam.id);
if (existing.length > 0) {
  logger.info('Templates already exist', { count: existing.length });
  process.exit(0);
}

// Create default CompanyCam templates
const templates = [
  {
    clientId: companyCam.id,
    description: 'Weekly development fee',
    unitPrice: 380000, // $3,800
    isDefault: true,
  },
  {
    clientId: companyCam.id,
    description: 'Claude Code Max subscription',
    unitPrice: 20000, // $200
    isDefault: false,
  },
  {
    clientId: companyCam.id,
    description: 'Windsurf Pro subscription',
    unitPrice: 5000, // $50
    isDefault: false,
  },
  {
    clientId: companyCam.id,
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
