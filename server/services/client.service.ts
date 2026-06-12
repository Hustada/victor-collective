/**
 * Client Service
 *
 * Business logic for the client registry. Clients are reusable across invoices;
 * each invoice snapshots the client's name/email at creation time.
 */

import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';

export type ClientStatus = 'prospect' | 'active';
export const CLIENT_STATUSES: ClientStatus[] = ['prospect', 'active'];

export interface Client {
  id: number;
  name: string;
  email: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

interface CreateClientInput {
  name: string;
  email?: string;
  notes?: string;
}

interface UpdateClientInput {
  name?: string;
  email?: string;
  notes?: string;
  status?: ClientStatus;
}

interface ClientRow {
  id: number;
  name: string;
  email: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    notes: row.notes,
    status: (CLIENT_STATUSES.includes(row.status as ClientStatus)
      ? row.status
      : 'active') as ClientStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const ClientService = {
  list(): Client[] {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM clients ORDER BY name COLLATE NOCASE')
      .all() as ClientRow[];
    return rows.map(mapClient);
  },

  getById(id: number): Client | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as ClientRow | undefined;
    return row ? mapClient(row) : null;
  },

  create(input: CreateClientInput): Client {
    const db = getDb();
    const result = db
      .prepare('INSERT INTO clients (name, email, notes) VALUES (?, ?, ?)')
      .run(input.name, input.email || null, input.notes || null);

    logger.info('Client created', { id: result.lastInsertRowid, name: input.name });
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, input: UpdateClientInput): Client {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Client ${id} not found`);
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }
    if (input.email !== undefined) {
      updates.push('email = ?');
      params.push(input.email || null);
    }
    if (input.notes !== undefined) {
      updates.push('notes = ?');
      params.push(input.notes || null);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      params.push(input.status);
    }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      logger.info('Client updated', { id, fields: Object.keys(input) });
    }

    return this.getById(id)!;
  },

  delete(id: number): void {
    const db = getDb();
    const client = this.getById(id);
    if (client) {
      db.prepare('DELETE FROM clients WHERE id = ?').run(id);
      logger.info('Client deleted', { id, name: client.name });
    }
  },

  /**
   * Auto-file a lead into the registry as a prospect. Idempotent by email
   * (case-insensitive): an existing client — prospect or active — is returned
   * untouched, never duplicated or downgraded.
   */
  fileProspect(input: { name: string; email: string; note?: string }): Client {
    const db = getDb();
    const existing = db
      .prepare('SELECT * FROM clients WHERE LOWER(email) = LOWER(?)')
      .get(input.email) as ClientRow | undefined;
    if (existing) return mapClient(existing);

    const result = db
      .prepare("INSERT INTO clients (name, email, notes, status) VALUES (?, ?, ?, 'prospect')")
      .run(input.name, input.email, input.note || null);
    logger.info('Prospect auto-filed', { id: result.lastInsertRowid, name: input.name });
    return this.getById(result.lastInsertRowid as number)!;
  },
};
