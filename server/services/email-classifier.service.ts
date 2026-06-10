/**
 * Email Intent Classifier
 *
 * Classifies an email into one of four triage intents using Claude Haiku
 * (cheap + fast — runs over every message), and caches the verdict in SQLite
 * keyed by the stable Message-ID so the inbox never re-classifies on load.
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
}

// Haiku over Opus by deliberate choice: classification runs on every email, so
// it must be cheap and fast. Drafting (feature 3) uses a stronger model.
const MODEL = 'claude-haiku-4-5';

// Minimal client shape — lets tests inject a stub without pulling in the SDK,
// and keeps the create() args loose so SDK type churn doesn't block the build.
export interface ClassifierClient {
  messages: {
    create(args: unknown): Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

const SYSTEM_PROMPT = `You triage an operator's inbox. Classify each email into exactly one intent:

- "reply": a person is asking something or expects a personal response from the operator. Action is owed.
- "money": invoices, payments, payouts, billing, receipts — anything financial.
- "waiting": the sender is getting back to the operator or says they'll follow up; no action owed right now.
- "noise": newsletters, product notifications, automated alerts, marketing — ignorable.

Return your best single classification and a confidence from 0 to 1.`;

const SCHEMA = {
  type: 'object',
  properties: {
    intent: { type: 'string', enum: INTENTS },
    confidence: { type: 'number' },
  },
  required: ['intent', 'confidence'],
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

function renderEmail(email: EmailToClassify): string {
  const body = email.body.slice(0, 2000);
  return `From: ${email.from}\nSubject: ${email.subject}\n\n${body}`;
}

function normalize(raw: { intent?: unknown; confidence?: unknown }): Classification {
  const intent = INTENTS.includes(raw.intent as Intent) ? (raw.intent as Intent) : 'noise';
  const n = typeof raw.confidence === 'number' ? raw.confidence : 0;
  const confidence = Math.max(0, Math.min(1, n));
  return { intent, confidence };
}

/**
 * Call Claude to classify a single email. Network-bound; the cache wrapper
 * below is what the app should use. `client` is injectable for testing.
 */
export async function classifyWithClaude(
  email: EmailToClassify,
  client: ClassifierClient = getClient()
): Promise<Classification> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: renderEmail(email) }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  let parsed: { intent?: unknown; confidence?: unknown };
  try {
    parsed = JSON.parse(text);
  } catch {
    logger.warn('Classifier returned unparseable output; defaulting to noise', { text });
    return { intent: 'noise', confidence: 0 };
  }
  return normalize(parsed);
}

export function getCachedClassification(messageId: string): Classification | null {
  const row = getDb()
    .prepare('SELECT intent, confidence FROM email_intelligence WHERE message_id = ?')
    .get(messageId) as { intent: string; confidence: number } | undefined;
  return row ? { intent: row.intent as Intent, confidence: row.confidence } : null;
}

export function cacheClassification(
  messageId: string,
  classification: Classification,
  model: string = MODEL
): void {
  getDb()
    .prepare(
      `INSERT INTO email_intelligence (message_id, intent, confidence, model)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(message_id) DO UPDATE SET
         intent = excluded.intent,
         confidence = excluded.confidence,
         model = excluded.model`
    )
    .run(messageId, classification.intent, classification.confidence, model);
}

/**
 * Return the cached intent for an email, classifying (and caching) on a miss.
 * `classify` is injectable so the cache logic can be tested without the LLM.
 */
export async function getOrClassify(
  messageId: string,
  email: EmailToClassify,
  classify: (email: EmailToClassify) => Promise<Classification> = classifyWithClaude
): Promise<Classification> {
  const cached = getCachedClassification(messageId);
  if (cached) return cached;

  const result = await classify(email);
  cacheClassification(messageId, result);
  logger.info('Email classified', {
    messageId,
    intent: result.intent,
    confidence: result.confidence,
  });
  return result;
}
