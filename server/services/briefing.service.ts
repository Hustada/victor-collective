/**
 * Inbox briefing: a synthesized stand-up line instead of raw counts.
 *
 * Built from the already-cached per-email summaries (no new per-email LLM
 * work) and cached by a content hash of the non-noise inbox state — the
 * model is only called when the inbox actually changes.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'crypto';
import { getDb } from '../lib/db.js';
import { noteEvent } from '../lib/ai-activity.js';
import { logger } from '../lib/logger.js';
import type { Intent, ClassifierClient } from './email-classifier.service.js';

// Haiku: the per-email summaries already condensed the inbox; this is a
// cheap synthesis call that runs at most once per inbox change.
const MODEL = 'claude-haiku-4-5';

export interface BriefingItem {
  messageId: string;
  intent: Intent;
  from: string;
  summary: string;
}

const CLEAR_TEXT = 'Inbox clear — nothing needs you.';

const SYSTEM_PROMPT = `You write a one-line stand-up brief of an operator's inbox from triaged email summaries. Lead with what needs the operator most, name the people, fold related items together, and keep money items explicit. Hard limit: 25 words. Telegraphic style is good ("Chris needs DNS access + training; Marc ready to pair on SPF"). Plain text, no preamble, no counts recap.`;

// Folded into the cache key: a prompt change makes every old key unreachable,
// so tuned briefings regenerate without any manual cache clearing.
const PROMPT_VERSION = createHash('sha256').update(SYSTEM_PROMPT).digest('hex').slice(0, 16);

let defaultClient: ClassifierClient | null = null;

function getClient(): ClassifierClient {
  if (!defaultClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set — required for the inbox briefing');
    }
    defaultClient = new Anthropic() as unknown as ClassifierClient;
  }
  return defaultClient;
}

/** Stable fingerprint of the inbox state AND the prompt the briefing was written under. */
export function briefingKey(items: BriefingItem[]): string {
  const canonical = items
    .map((i) => `${i.messageId}|${i.intent}|${i.summary}`)
    .sort()
    .join('\n');
  return createHash('sha256').update(`${PROMPT_VERSION}\n${canonical}`).digest('hex');
}

export async function generateBriefingWithClaude(
  items: BriefingItem[],
  client: ClassifierClient = getClient()
): Promise<string> {
  const rendered = items
    .map((i) => `[${i.intent}] ${i.from} — ${i.summary || '(no summary)'}`)
    .join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: rendered }],
  });

  return (response.content.find((b) => b.type === 'text')?.text ?? '').trim();
}

/**
 * Cache-first briefing. A failure returns '' (the UI falls back to counts)
 * and is NOT cached, so the next load retries.
 */
export async function getOrGenerateBriefing(
  items: BriefingItem[],
  generate: (items: BriefingItem[]) => Promise<string> = generateBriefingWithClaude
): Promise<string> {
  if (items.length === 0) return CLEAR_TEXT;

  const key = briefingKey(items);
  const db = getDb();
  const cached = db.prepare('SELECT text FROM briefings WHERE key = ?').get(key) as
    | { text: string }
    | undefined;
  if (cached) return cached.text;

  try {
    const text = await generate(items);
    db.prepare(
      `INSERT INTO briefings (key, text, model) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET text = excluded.text, model = excluded.model`
    ).run(key, text, MODEL);
    noteEvent('briefing synthesized');
    logger.info('Briefing generated', { items: items.length });
    return text;
  } catch (err) {
    logger.warn('Briefing generation failed; falling back to counts', {
      error: (err as Error).message,
    });
    return '';
  }
}
