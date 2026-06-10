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
