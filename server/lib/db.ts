/**
 * Invoice database connection helper
 *
 * Manages SQLite connection for the invoice system
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.INVOICE_DB_PATH || path.join(__dirname, '..', 'data', 'invoices.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'invoices.sql');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const database = getDb();

  // Check if tables exist
  const tableExists = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'")
    .get();

  if (!tableExists) {
    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    database.exec(schema);
  }

  runMigrations(database);
}

/**
 * Idempotent migrations for existing databases.
 * Each migration checks current state before applying, so it is safe on every boot.
 */
function runMigrations(database: Database.Database): void {
  const columns = database.prepare('PRAGMA table_info(invoices)').all() as { name: string }[];

  if (!columns.some((c) => c.name === 'client_email')) {
    database.exec('ALTER TABLE invoices ADD COLUMN client_email TEXT');
  }

  if (!columns.some((c) => c.name === 'client_id')) {
    database.exec('ALTER TABLE invoices ADD COLUMN client_id INTEGER');
  }

  // Clients registry (no-op if the schema already created it)
  database.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
    CREATE TRIGGER IF NOT EXISTS clients_updated_at
      AFTER UPDATE ON clients
      BEGIN
        UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
  `);

  seedCompanyCamClient(database);
  migrateTemplatesToClientId(database);

  // Intent-classification cache (no-op if the schema already created it)
  database.exec(`
    CREATE TABLE IF NOT EXISTS email_intelligence (
      message_id TEXT PRIMARY KEY,
      intent TEXT NOT NULL,
      confidence REAL NOT NULL,
      model TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // AI one-line summaries (NULL on legacy rows -> re-classified on next load)
  const intelColumns = database.prepare('PRAGMA table_info(email_intelligence)').all() as {
    name: string;
  }[];
  if (!intelColumns.some((c) => c.name === 'summary')) {
    database.exec('ALTER TABLE email_intelligence ADD COLUMN summary TEXT');
  }

  // Portal auth sessions (no-op if the schema already created it)
  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// CompanyCam's accounts-payable inbox; used as the seed/backfill default.
const COMPANYCAM_BILLING_EMAIL = 'ap@companycam.com';

/**
 * Migrate invoice_templates from a client_name string to a client_id link.
 * Backfills client_id by joining the clients registry on name, then drops the
 * legacy column. Runs after seedCompanyCamClient so the registry row exists.
 * Safe to run repeatedly: a no-op once client_name is gone.
 */
function migrateTemplatesToClientId(database: Database.Database): void {
  const columns = database.prepare('PRAGMA table_info(invoice_templates)').all() as {
    name: string;
  }[];

  if (!columns.some((c) => c.name === 'client_name')) return;

  if (!columns.some((c) => c.name === 'client_id')) {
    database.exec('ALTER TABLE invoice_templates ADD COLUMN client_id INTEGER');
  }

  database.exec(`
    UPDATE invoice_templates
    SET client_id = (SELECT id FROM clients WHERE clients.name = invoice_templates.client_name)
    WHERE client_id IS NULL
  `);

  // Drop the legacy column (and its index) now that client_id is populated.
  database.exec('DROP INDEX IF EXISTS idx_templates_client');
  database.exec('ALTER TABLE invoice_templates DROP COLUMN client_name');
  database.exec('CREATE INDEX IF NOT EXISTS idx_templates_client ON invoice_templates(client_id)');
}

/**
 * Migrate the legacy hardcoded "CompanyCam" client into the registry.
 * Uses the most recent client_email seen on a CompanyCam invoice, and links
 * existing CompanyCam invoices to the new client row. Safe to run repeatedly.
 */
function seedCompanyCamClient(database: Database.Database): void {
  const existing = database
    .prepare('SELECT id, email FROM clients WHERE name = ?')
    .get('CompanyCam') as { id: number; email: string | null } | undefined;

  if (existing) {
    // Backfill the billing email if the row was seeded blank.
    if (!existing.email) {
      database
        .prepare('UPDATE clients SET email = ? WHERE id = ?')
        .run(COMPANYCAM_BILLING_EMAIL, existing.id);
    }
    return;
  }

  const lastEmail = database
    .prepare(
      `SELECT client_email FROM invoices
       WHERE client_name = 'CompanyCam' AND client_email IS NOT NULL
       ORDER BY id DESC LIMIT 1`
    )
    .get() as { client_email: string } | undefined;

  const result = database
    .prepare('INSERT INTO clients (name, email) VALUES (?, ?)')
    .run('CompanyCam', lastEmail?.client_email ?? COMPANYCAM_BILLING_EMAIL);

  database
    .prepare('UPDATE invoices SET client_id = ? WHERE client_name = ? AND client_id IS NULL')
    .run(result.lastInsertRowid, 'CompanyCam');
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// For testing: use in-memory database
export function useTestDb(): Database.Database {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  return db;
}

export function resetTestDb(): void {
  if (db) {
    db.exec('DELETE FROM line_items');
    db.exec('DELETE FROM invoices');
    db.exec('DELETE FROM invoice_templates');
    db.exec('DELETE FROM clients');
    db.exec('DELETE FROM email_intelligence');
    db.exec('DELETE FROM sessions');
    db.exec(
      "DELETE FROM sqlite_sequence WHERE name IN ('invoices', 'line_items', 'invoice_templates', 'clients')"
    );
  }
}
