/**
 * Email Intent Classifier + Summarizer
 *
 * One Claude Haiku call per chunk of ~15 emails returns BOTH the triage intent
 * and a one-line summary for each (cheap + fast — runs over every message).
 * Verdicts are cached in SQLite keyed by the stable Message-ID so the inbox
 * never re-classifies on load. Emails are numbered in the prompt and results
 * come back as an indexed array to rule out misalignment.
 */

import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';

export type Intent = 'reply' | 'money' | 'waiting' | 'noise';
export const INTENTS: Intent[] = ['reply', 'money', 'waiting', 'noise'];

export interface EmailToClassify {
  subject: string;
  from: string;
  body: string;
}

export interface Classification {
  intent: Intent;
  confidence: number; // 0..1
  summary: string; // one-line AI summary; '' when unavailable
}

// Haiku over Opus by deliberate choice: classification runs on every email, so
// it must be cheap and fast. Drafting (feature 3) uses a stronger model.
const MODEL = 'claude-haiku-4-5';

// Emails per prompt. Amortizes the system prompt and cuts call count ~15x;
// large enough to matter, small enough that output stays well under max_tokens.
export const CHUNK_SIZE = 15;

// Minimal client shape — lets tests inject a stub without pulling in the SDK,
// and keeps the create() args loose so SDK type churn doesn't block the build.
export interface ClassifierClient {
  messages: {
    create(args: unknown): Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

const SYSTEM_PROMPT = `You triage an operator's inbox. You will receive several numbered emails. For EACH email, return its number, one intent, a confidence, and a one-line summary.

Intents:
- "reply": a person is asking something or expects a personal response from the operator. Action is owed.
- "money": invoices, payments, payouts, billing, receipts — anything financial.
- "waiting": the sender is getting back to the operator or says they'll follow up; no action owed right now.
- "noise": newsletters, product notifications, automated alerts, marketing — ignorable.

Summaries: at most 12 words, concrete, lead with what the sender wants or what happened ("Wants to meet this week + training", "Invoice #42 due Friday — $1,200"). Never start with "Email about" or restate the subject verbatim.`;

const SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          intent: { type: 'string', enum: INTENTS },
          confidence: { type: 'number' },
          summary: { type: 'string' },
        },
        required: ['index', 'intent', 'confidence', 'summary'],
        additionalProperties: false,
      },
    },
  },
  required: ['results'],
  additionalProperties: false,
} as const;

let defaultClient: ClassifierClient | null = null;

function getClient(): ClassifierClient {
  if (!defaultClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set — required for email classification');
    }
    defaultClient = new Anthropic() as unknown as ClassifierClient;
  }
  return defaultClient;
}

function renderChunk(emails: EmailToClassify[]): string {
  return emails
    .map(
      (e, i) =>
        `Email ${i + 1}:\nFrom: ${e.from}\nSubject: ${e.subject}\n\n${e.body.slice(0, 2000)}`
    )
    .join('\n\n---\n\n');
}

const NOISE: Classification = { intent: 'noise', confidence: 0, summary: '' };

function normalize(raw: {
  intent?: unknown;
  confidence?: unknown;
  summary?: unknown;
}): Classification {
  const intent = INTENTS.includes(raw.intent as Intent) ? (raw.intent as Intent) : 'noise';
  const n = typeof raw.confidence === 'number' ? raw.confidence : 0;
  const confidence = Math.max(0, Math.min(1, n));
  const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';
  return { intent, confidence, summary };
}

/**
 * Classify + summarize a chunk of emails in ONE Claude call. Returns verdicts
 * aligned with the input order; an email the model skipped defaults to noise.
 * Network-bound; classifyBatch (cache-first) is what the app should use.
 * `client` is injectable for testing.
 */
export async function classifyChunkWithClaude(
  emails: EmailToClassify[],
  client: ClassifierClient = getClient()
): Promise<Classification[]> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: renderChunk(emails) }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  let parsed: { results?: Array<{ index?: unknown }> };
  try {
    parsed = JSON.parse(text);
  } catch {
    logger.warn('Classifier returned unparseable output; defaulting chunk to noise', { text });
    return emails.map(() => NOISE);
  }

  const byIndex = new Map<number, Classification>();
  for (const item of parsed.results ?? []) {
    if (typeof item.index === 'number') byIndex.set(item.index, normalize(item));
  }
  return emails.map((_, i) => byIndex.get(i + 1) ?? NOISE);
}

export function getCachedClassification(messageId: string): Classification | null {
  const row = getDb()
    .prepare('SELECT intent, confidence, summary FROM email_intelligence WHERE message_id = ?')
    .get(messageId) as { intent: string; confidence: number; summary: string | null } | undefined;
  // A NULL summary marks a pre-summaries row — treat as a miss so it upgrades.
  if (!row || row.summary === null) return null;
  return { intent: row.intent as Intent, confidence: row.confidence, summary: row.summary };
}

export function cacheClassification(
  messageId: string,
  classification: Classification,
  model: string = MODEL
): void {
  getDb()
    .prepare(
      `INSERT INTO email_intelligence (message_id, intent, confidence, summary, model)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(message_id) DO UPDATE SET
         intent = excluded.intent,
         confidence = excluded.confidence,
         summary = excluded.summary,
         model = excluded.model`
    )
    .run(
      messageId,
      classification.intent,
      classification.confidence,
      classification.summary,
      model
    );
}

// Triage priority: needs-a-reply and money first, noise last.
export const INTENT_RANK: Record<Intent, number> = { reply: 0, money: 1, waiting: 2, noise: 3 };

/** Sort by triage priority, then newest first within each band. */
export function sortByIntent<T extends { intent: Intent; date: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      INTENT_RANK[a.intent] - INTENT_RANK[b.intent] ||
      (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)
  );
}

export interface ClassifiableEmail extends EmailToClassify {
  messageId: string;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Classify a batch of emails: cache hits are served from SQLite, misses go to
 * the model in chunks (in parallel), and fresh verdicts are cached. A failing
 * chunk degrades to "noise" WITHOUT caching — e.g. a missing API key — so the
 * inbox never fails and the emails retry on the next load.
 */
export async function classifyBatch(
  items: ClassifiableEmail[],
  classifyChunk: (emails: EmailToClassify[]) => Promise<Classification[]> = classifyChunkWithClaude
): Promise<Map<string, Classification>> {
  const verdicts = new Map<string, Classification>();
  const misses: ClassifiableEmail[] = [];

  for (const item of items) {
    const cached = getCachedClassification(item.messageId);
    if (cached) verdicts.set(item.messageId, cached);
    else misses.push(item);
  }

  await Promise.all(
    chunk(misses, CHUNK_SIZE).map(async (group) => {
      try {
        const results = await classifyChunk(group);
        group.forEach((item, i) => {
          const verdict = results[i] ?? NOISE;
          cacheClassification(item.messageId, verdict);
          verdicts.set(item.messageId, verdict);
        });
        logger.info('Email chunk classified', { count: group.length });
      } catch (err) {
        logger.warn('Chunk classification failed; degrading to noise', {
          count: group.length,
          error: (err as Error).message,
        });
        group.forEach((item) => verdicts.set(item.messageId, NOISE));
      }
    })
  );

  return verdicts;
}
