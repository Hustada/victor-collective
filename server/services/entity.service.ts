/**
 * Entity lookup: who is this email address, across everything we know —
 * the client registry, billing history, and the audience list. Powers the
 * inbox entity card: context at the moment of reply.
 */

import { getDb } from '../lib/db.js';
import type { ClientStatus } from './client.service.js';

export interface Entity {
  client: { id: number; name: string; status: ClientStatus } | null;
  billing: {
    invoiceCount: number;
    totalBilled: number; // cents
    lastInvoice: { number: string; status: string; total: number } | null;
  } | null;
  audience: { source: string; tags: string[]; createdAt: string } | null;
}

export function lookupEntity(email: string): Entity | null {
  const db = getDb();
  const key = email.trim().toLowerCase();
  if (!key) return null;

  const client = db
    .prepare('SELECT id, name, status FROM clients WHERE LOWER(email) = ?')
    .get(key) as { id: number; name: string; status: ClientStatus } | undefined;

  let billing: Entity['billing'] = null;
  if (client) {
    const rollup = db
      .prepare(
        'SELECT COUNT(*) AS n, COALESCE(SUM(total), 0) AS sum FROM invoices WHERE client_id = ?'
      )
      .get(client.id) as { n: number; sum: number };
    const last = db
      .prepare(
        'SELECT invoice_number, status, total FROM invoices WHERE client_id = ? ORDER BY id DESC LIMIT 1'
      )
      .get(client.id) as { invoice_number: string; status: string; total: number } | undefined;
    billing = {
      invoiceCount: rollup.n,
      totalBilled: rollup.sum,
      lastInvoice: last
        ? { number: last.invoice_number, status: last.status, total: last.total }
        : null,
    };
  }

  const sub = db
    .prepare('SELECT source, tags, created_at FROM subscribers WHERE LOWER(email) = ?')
    .get(key) as { source: string; tags: string | null; created_at: string } | undefined;

  let audience: Entity['audience'] = null;
  if (sub) {
    let tags: string[] = [];
    try {
      const parsed = JSON.parse(sub.tags ?? '[]');
      if (Array.isArray(parsed)) tags = parsed;
    } catch {
      // malformed tags read as none
    }
    audience = { source: sub.source, tags, createdAt: sub.created_at };
  }

  if (!client && !audience) return null;
  return { client: client ?? null, billing, audience };
}
