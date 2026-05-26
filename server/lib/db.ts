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
  const tableExists = database.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'"
  ).get();

  if (!tableExists) {
    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    database.exec(schema);
  }
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
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('invoices', 'line_items', 'invoice_templates')");
  }
}
