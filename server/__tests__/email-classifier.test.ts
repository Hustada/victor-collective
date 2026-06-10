import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { useTestDb, closeDb, resetTestDb } from '../lib/db.js';
import type { ClassifierClient, EmailToClassify } from '../services/email-classifier.service.js';

// Import the service after the test DB is wired up
let svc: typeof import('../services/email-classifier.service.js');

beforeAll(async () => {
  useTestDb();
  svc = await import('../services/email-classifier.service.js');
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

// Stub Anthropic client that returns a single text block — no network.
function stubClient(text: string): ClassifierClient {
  return {
    messages: {
      create: async () => ({ content: [{ type: 'text', text }] }),
    },
  };
}

const email: EmailToClassify = {
  subject: 'Re: this week',
  from: 'chris@example.com',
  body: 'Can we get together this week? I need some training.',
};

describe('classifyWithClaude', () => {
  it('maps a structured response to a classification', async () => {
    const result = await svc.classifyWithClaude(
      email,
      stubClient(JSON.stringify({ intent: 'reply', confidence: 0.82 }))
    );
    expect(result).toEqual({ intent: 'reply', confidence: 0.82 });
  });

  it('falls back to noise on an unknown intent and clamps confidence', async () => {
    const result = await svc.classifyWithClaude(
      email,
      stubClient(JSON.stringify({ intent: 'banana', confidence: 1.5 }))
    );
    expect(result).toEqual({ intent: 'noise', confidence: 1 });
  });

  it('defaults to noise on unparseable output', async () => {
    const result = await svc.classifyWithClaude(email, stubClient('not json at all'));
    expect(result).toEqual({ intent: 'noise', confidence: 0 });
  });
});

describe('classification cache', () => {
  it('returns null for an uncached message', () => {
    expect(svc.getCachedClassification('missing-id')).toBeNull();
  });

  it('classifies on a miss, then serves from cache without re-calling', async () => {
    const classify = vi.fn(async () => ({ intent: 'money' as const, confidence: 0.9 }));

    const first = await svc.getOrClassify('mid-1', email, classify);
    expect(first).toEqual({ intent: 'money', confidence: 0.9 });
    expect(classify).toHaveBeenCalledTimes(1);

    const second = await svc.getOrClassify('mid-1', email, classify);
    expect(second).toEqual({ intent: 'money', confidence: 0.9 });
    expect(classify).toHaveBeenCalledTimes(1); // served from cache, not re-classified
  });

  it('upserts an existing classification', () => {
    svc.cacheClassification('mid-2', { intent: 'reply', confidence: 0.5 });
    svc.cacheClassification('mid-2', { intent: 'waiting', confidence: 0.7 });
    expect(svc.getCachedClassification('mid-2')).toEqual({ intent: 'waiting', confidence: 0.7 });
  });
});

describe('sortByIntent', () => {
  it('orders by intent priority, then newest first within a band', () => {
    const items = [
      { id: 'noise-old', intent: 'noise' as const, date: '2026-06-01T00:00:00Z' },
      { id: 'reply-old', intent: 'reply' as const, date: '2026-06-01T00:00:00Z' },
      { id: 'reply-new', intent: 'reply' as const, date: '2026-06-09T00:00:00Z' },
      { id: 'money', intent: 'money' as const, date: '2026-06-05T00:00:00Z' },
    ];
    expect(svc.sortByIntent(items).map((i) => i.id)).toEqual([
      'reply-new',
      'reply-old',
      'money',
      'noise-old',
    ]);
  });
});

describe('classifyBatch', () => {
  const items = [
    { messageId: 'a', subject: 'invoice', from: 'billing@x.com', body: 'you owe $100' },
    { messageId: 'b', subject: 'hi', from: 'chris@x.com', body: 'can we meet?' },
  ];

  it('returns a verdict per message and caches them', async () => {
    const classify = vi.fn(async (e: EmailToClassify) => ({
      intent: (e.subject === 'invoice' ? 'money' : 'reply') as 'money' | 'reply',
      confidence: 0.8,
    }));

    const map = await svc.classifyBatch(items, classify);
    expect(map.get('a')).toEqual({ intent: 'money', confidence: 0.8 });
    expect(map.get('b')).toEqual({ intent: 'reply', confidence: 0.8 });
    expect(classify).toHaveBeenCalledTimes(2);

    // Second run is fully cached — no further model calls
    await svc.classifyBatch(items, classify);
    expect(classify).toHaveBeenCalledTimes(2);
  });

  it('degrades a failing classification to noise without failing the batch', async () => {
    const classify = vi.fn(async () => {
      throw new Error('no API key');
    });
    const map = await svc.classifyBatch([items[0]], classify);
    expect(map.get('a')).toEqual({ intent: 'noise', confidence: 0 });
  });
});
