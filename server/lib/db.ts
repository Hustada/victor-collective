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
}

/**
 * Migrate the legacy hardcoded "CompanyCam" client into the registry.
 * Uses the most recent client_email seen on a CompanyCam invoice, and links
 * existing CompanyCam invoices to the new client row. Safe to run repeatedly.
 */
function seedCompanyCamClient(database: Database.Database): void {
  const existing = database.prepare('SELECT id FROM clients WHERE name = ?').get('CompanyCam') as
    | { id: number }
    | undefined;
  if (existing) return;

  const lastEmail = database
    .prepare(
      `SELECT client_email FROM invoices
       WHERE client_name = 'CompanyCam' AND client_email IS NOT NULL
       ORDER BY id DESC LIMIT 1`
    )
    .get() as { client_email: string } | undefined;

  const result = database
    .prepare('INSERT INTO clients (name, email) VALUES (?, ?)')
    .run('CompanyCam', lastEmail?.client_email ?? null);

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
    db.exec(
      "DELETE FROM sqlite_sequence WHERE name IN ('invoices', 'line_items', 'invoice_templates', 'clients')"
    );
  }
}
