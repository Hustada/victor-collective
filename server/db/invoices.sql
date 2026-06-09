-- Invoice system tables for Victor Collective API
-- Run: sqlite3 data/invoices.db < db/invoices.sql

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,    -- TVC-2026-041
  client_id INTEGER,                      -- registry link; name/email below are a snapshot
  client_name TEXT NOT NULL,
  client_email TEXT,
  week_ending DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',   -- draft | sent | paid
  subtotal INTEGER NOT NULL,              -- cents
  total INTEGER NOT NULL,                 -- cents
  notes TEXT,
  pdf_path TEXT,
  email_body TEXT,
  sent_at DATETIME,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,            -- cents
  amount INTEGER NOT NULL,                -- cents
  is_recurring BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoice_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  description TEXT NOT NULL,
  unit_price INTEGER NOT NULL,            -- cents
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_week_ending ON invoices(week_ending);
CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_templates_client ON invoice_templates(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- Trigger to update updated_at on invoice changes
CREATE TRIGGER IF NOT EXISTS invoices_updated_at
  AFTER UPDATE ON invoices
  BEGIN
    UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Trigger to update updated_at on client changes
CREATE TRIGGER IF NOT EXISTS clients_updated_at
  AFTER UPDATE ON clients
  BEGIN
    UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
