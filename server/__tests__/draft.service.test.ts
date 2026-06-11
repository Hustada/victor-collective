import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { useTestDb, closeDb, resetTestDb, getDb } from '../lib/db.js';
import type { ClassifierClient } from '../services/email-classifier.service.js';
import type { DraftableEmail, SentExample } from '../services/draft.service.js';

let svc: typeof import('../services/draft.service.js');

beforeAll(async () => {
  useTestDb();
  svc = await import('../services/draft.service.js');
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

const examples: SentExample[] = [
  { to: 'chris@x.com', subject: 'Re: DNS', body: 'Chris — done. Records are live.\n\nMark' },
];

const replyEmail: DraftableEmail = {
  messageId: 'mid-reply',
  subject: 'Re: this week',
  from: 'Chris Johnson <chris@x.com>',
  body: 'Can we get together this week? I need some training.',
  intent: 'reply',
};

const noiseEmail: DraftableEmail = {
  messageId: 'mid-noise',
  subject: 'Newsletter',
  from: 'news@x.com',
  body: 'This week in tech...',
  intent: 'noise',
};

describe('generateDraftWithClaude', () => {
  it('returns the drafted body text, trimmed', async () => {
    const body = await svc.generateDraftWithClaude(
      replyEmail,
      examples,
      stubClient('  Chris — let’s do Thursday.\n\nMark  ')
    );
    expect(body).toBe('Chris — let’s do Thursday.\n\nMark');
  });

  it('throws on an empty draft rather than saving a blank', async () => {
    await expect(
      svc.generateDraftWithClaude(replyEmail, examples, stubClient('   '))
    ).rejects.toThrow();
  });
});

describe('draft persistence', () => {
  it('returns null for an email with no draft', () => {
    expect(svc.getDraft('missing')).toBeNull();
  });

  it('round-trips a saved draft with generated state', () => {
    svc.saveDraft('mid-1', 'Body text', 'test-model');
    expect(svc.getDraft('mid-1')).toEqual({
      body: 'Body text',
      originalBody: 'Body text',
      model: 'test-model',
      state: 'generated',
    });
  });

  it('marks a draft sent, capturing the final (possibly edited) body', () => {
    svc.saveDraft('mid-2', 'Generated text', 'test-model');
    svc.markDraftSent('mid-2', 'Edited by Mark before sending');

    const draft = svc.getDraft('mid-2');
    expect(draft?.state).toBe('sent');
    expect(draft?.body).toBe('Edited by Mark before sending');
    // The generated original is preserved — that diff is voice-tuning signal.
    expect(draft?.originalBody).toBe('Generated text');
  });

  it('ignores markDraftSent for an unknown message', () => {
    expect(() => svc.markDraftSent('missing', 'whatever')).not.toThrow();
    expect(svc.getDraft('missing')).toBeNull();
  });

  it('stamps a saved draft with the prompt version, for provenance only', () => {
    svc.saveDraft('mid-3', 'Body text', 'test-model');
    const row = getDb()
      .prepare('SELECT prompt_version FROM drafts WHERE message_id = ?')
      .get('mid-3') as { prompt_version: string };
    expect(row.prompt_version).toBe(svc.PROMPT_VERSION);
    expect(svc.PROMPT_VERSION).toMatch(/^[0-9a-f]{16}$/);
    // Provenance only: an old-prompt draft is still served (Opus drafts are
    // expensive and user-visible; Regenerate is the explicit refresh path).
    expect(svc.getDraft('mid-3')).not.toBeNull();
  });
});

describe('draftAhead', () => {
  it('drafts only reply and money emails', async () => {
    const generate = vi.fn(async (e: DraftableEmail) => `Draft for ${e.messageId}`);
    const moneyEmail: DraftableEmail = { ...replyEmail, messageId: 'mid-money', intent: 'money' };
    const waitingEmail: DraftableEmail = {
      ...replyEmail,
      messageId: 'mid-wait',
      intent: 'waiting',
    };

    const count = await svc.draftAhead(
      [replyEmail, moneyEmail, waitingEmail, noiseEmail],
      generate
    );

    expect(count).toBe(2);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(svc.getDraft('mid-reply')?.body).toBe('Draft for mid-reply');
    expect(svc.getDraft('mid-money')?.body).toBe('Draft for mid-money');
    expect(svc.getDraft('mid-wait')).toBeNull();
    expect(svc.getDraft('mid-noise')).toBeNull();
  });

  it('skips emails that already have a draft — no repeat API calls', async () => {
    svc.saveDraft('mid-reply', 'Existing draft', 'test-model');
    const generate = vi.fn(async () => 'New draft');

    const count = await svc.draftAhead([replyEmail], generate);

    expect(count).toBe(0);
    expect(generate).not.toHaveBeenCalled();
    expect(svc.getDraft('mid-reply')?.body).toBe('Existing draft');
  });

  it('continues past a failing generation without caching it', async () => {
    const other: DraftableEmail = { ...replyEmail, messageId: 'mid-ok' };
    const generate = vi
      .fn(async (e: DraftableEmail) => `Draft for ${e.messageId}`)
      .mockRejectedValueOnce(new Error('model unavailable'));

    const count = await svc.draftAhead([replyEmail, other], generate);

    expect(count).toBe(1);
    expect(svc.getDraft('mid-reply')).toBeNull(); // failed: not cached, retries next load
    expect(svc.getDraft('mid-ok')?.body).toBe('Draft for mid-ok');
  });
});

describe('regenerateDraft', () => {
  it('replaces an existing draft and resets its state', async () => {
    svc.saveDraft('mid-3', 'Old draft', 'test-model');
    svc.markDraftSent('mid-3', 'Old draft');

    const email: DraftableEmail = { ...replyEmail, messageId: 'mid-3' };
    const draft = await svc.regenerateDraft(email, examples, stubClient('Fresh take.\n\nMark'));

    expect(draft.body).toBe('Fresh take.\n\nMark');
    expect(draft.state).toBe('generated');
    expect(svc.getDraft('mid-3')?.body).toBe('Fresh take.\n\nMark');
  });
});
