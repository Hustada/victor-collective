import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { createHash } from 'crypto';
import { useTestDb, closeDb, resetTestDb, getDb } from '../lib/db.js';
import type { ClassifierClient } from '../services/email-classifier.service.js';
import type { BriefingItem } from '../services/briefing.service.js';

let svc: typeof import('../services/briefing.service.js');

beforeAll(async () => {
  useTestDb();
  svc = await import('../services/briefing.service.js');
});

beforeEach(() => {
  resetTestDb();
});

afterAll(() => {
  closeDb();
});

function stubClient(text: string): ClassifierClient {
  return {
    messages: {
      create: async () => ({ content: [{ type: 'text', text }] }),
    },
  };
}

const items: BriefingItem[] = [
  {
    messageId: 'a',
    intent: 'reply',
    from: 'Chris Johnson',
    summary: 'Wants to meet this week + training',
  },
  { messageId: 'b', intent: 'money', from: 'Telnyx', summary: 'Low balance — payment required' },
];

describe('briefingKey', () => {
  it('is stable for the same inbox state regardless of order', () => {
    expect(svc.briefingKey(items)).toBe(svc.briefingKey([...items].reverse()));
  });

  it('changes when an email or its summary changes', () => {
    const changed = [items[0], { ...items[1], summary: 'Paid in full' }];
    expect(svc.briefingKey(items)).not.toBe(svc.briefingKey(changed));
  });
});

describe('getOrGenerateBriefing', () => {
  it('generates once and serves the cache while the inbox is unchanged', async () => {
    const generate = vi.fn(async () => 'Chris wants to meet; Telnyx needs credit.');

    const first = await svc.getOrGenerateBriefing(items, generate);
    expect(first).toBe('Chris wants to meet; Telnyx needs credit.');
    expect(generate).toHaveBeenCalledTimes(1);

    const second = await svc.getOrGenerateBriefing(items, generate);
    expect(second).toBe('Chris wants to meet; Telnyx needs credit.');
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('regenerates when the inbox state changes', async () => {
    const generate = vi.fn(async () => 'brief');
    await svc.getOrGenerateBriefing(items, generate);
    await svc.getOrGenerateBriefing([items[0]], generate);
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('does not serve a briefing cached under a different prompt', async () => {
    // A row keyed the pre-versioning way: items only, no prompt in the hash.
    const canonical = items
      .map((i) => `${i.messageId}|${i.intent}|${i.summary}`)
      .sort()
      .join('\n');
    const itemsOnlyKey = createHash('sha256').update(canonical).digest('hex');
    getDb()
      .prepare('INSERT INTO briefings (key, text, model) VALUES (?, ?, ?)')
      .run(itemsOnlyKey, 'stale brief from an old prompt', 'claude-haiku-4-5');

    const generate = vi.fn(async () => 'fresh brief');
    expect(await svc.getOrGenerateBriefing(items, generate)).toBe('fresh brief');
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('returns a static line for a clear inbox without calling the model', async () => {
    const generate = vi.fn(async () => 'should not be called');
    const text = await svc.getOrGenerateBriefing([], generate);
    expect(text).toMatch(/clear/i);
    expect(generate).not.toHaveBeenCalled();
  });

  it('degrades to empty string on failure without caching', async () => {
    const generate = vi
      .fn(async () => 'Recovered brief.')
      .mockRejectedValueOnce(new Error('model unavailable'));

    expect(await svc.getOrGenerateBriefing(items, generate)).toBe('');
    expect(await svc.getOrGenerateBriefing(items, generate)).toBe('Recovered brief.');
  });
});

describe('generateBriefingWithClaude', () => {
  it('returns the trimmed brief text', async () => {
    const text = await svc.generateBriefingWithClaude(
      items,
      stubClient('  Chris wants training this week; Telnyx balance needs credit.  ')
    );
    expect(text).toBe('Chris wants training this week; Telnyx balance needs credit.');
  });
});
