import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { useTestDb, closeDb, resetTestDb, getDb } from '../lib/db.js';

let svc: typeof import('../services/entity.service.js');

beforeAll(async () => {
  useTestDb();
  svc = await import('../services/entity.service.js');
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

describe('lookupEntity', () => {
  it('returns null for a completely unknown email', () => {
    expect(svc.lookupEntity('stranger@nowhere.com')).toBeNull();
  });

  it('returns client + billing rollup for a known client email', () => {
    const db = getDb();
    const client = db
      .prepare(
        "INSERT INTO clients (name, email, status) VALUES ('CompanyCam', 'ap@companycam.com', 'active')"
      )
      .run();
    db.prepare(
      `INSERT INTO invoices (invoice_number, client_id, client_name, client_email, week_ending, status, subtotal, total)
       VALUES ('TVC-2026-001', ?, 'CompanyCam', 'ap@companycam.com', '2026-06-05', 'paid', 380000, 380000)`
    ).run(client.lastInsertRowid);
    db.prepare(
      `INSERT INTO invoices (invoice_number, client_id, client_name, client_email, week_ending, status, subtotal, total)
       VALUES ('TVC-2026-002', ?, 'CompanyCam', 'ap@companycam.com', '2026-06-12', 'sent', 400000, 400000)`
    ).run(client.lastInsertRowid);

    const entity = svc.lookupEntity('AP@companycam.com'); // case-insensitive
    expect(entity?.client).toMatchObject({ name: 'CompanyCam', status: 'active' });
    expect(entity?.billing).toEqual({
      invoiceCount: 2,
      totalBilled: 780000,
      lastInvoice: { number: 'TVC-2026-002', status: 'sent', total: 400000 },
    });
    expect(entity?.audience).toBeNull();
  });

  it('returns audience capture for a known subscriber who is not a client', () => {
    getDb()
      .prepare(
        `INSERT INTO subscribers (email, source, context, tags) VALUES ('jane@co.com', 'contact', 'Wants a mockup tool', '["lead"]')`
      )
      .run();

    const entity = svc.lookupEntity('jane@co.com');
    expect(entity?.client).toBeNull();
    expect(entity?.billing).toBeNull();
    expect(entity?.audience).toMatchObject({ source: 'contact', tags: ['lead'] });
  });

  it('combines client and audience when both exist', () => {
    const db = getDb();
    db.prepare(
      "INSERT INTO clients (name, email, status) VALUES ('Jane Doe', 'jane@co.com', 'prospect')"
    ).run();
    db.prepare(
      `INSERT INTO subscribers (email, source, tags) VALUES ('jane@co.com', 'contact', '["lead"]')`
    ).run();

    const entity = svc.lookupEntity('jane@co.com');
    expect(entity?.client?.status).toBe('prospect');
    expect(entity?.billing).toEqual({ invoiceCount: 0, totalBilled: 0, lastInvoice: null });
    expect(entity?.audience?.tags).toEqual(['lead']);
  });
});
