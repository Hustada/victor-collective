/**
 * Email Inbox Service
 *
 * IMAP integration for Namecheap Private Email.
 * Fetches, reads, and manages emails from victorhustad@victorcollective.com
 */

import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { logger } from '../lib/logger.js';
import {
  type Intent,
  type ClassifiableEmail,
  classifyBatch,
  sortByIntent,
  getCachedClassification,
} from './email-classifier.service.js';

interface EmailSummary {
  uid: number;
  subject: string;
  from: { name: string; address: string };
  date: string;
  seen: boolean;
  hasAttachments: boolean;
  preview: string;
  intent: Intent;
  confidence: number;
}

interface EmailFull extends EmailSummary {
  to: { name: string; address: string }[];
  // Raw email HTML stays server-side: it is attacker-controlled markup (Issue #4).
  text: string | null;
  attachments: { filename: string; contentType: string; size: number }[];
}

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.IMAP_PORT || '993'),
  secure: true,
  auth: {
    user: process.env.IMAP_USER || '',
    pass: process.env.IMAP_PASS || '',
  },
  logger: false,
};

async function getClient(): Promise<ImapFlow> {
  const client = new ImapFlow(IMAP_CONFIG);
  await client.connect();
  return client;
}

export async function listEmails(
  folder = 'INBOX',
  limit = 50,
  offset = 0
): Promise<{ emails: EmailSummary[]; total: number }> {
  const client = await getClient();

  try {
    const lock = await client.getMailboxLock(folder);

    try {
      const mailbox = client.mailbox;
      const total = mailbox?.exists || 0;

      if (total === 0) {
        return { emails: [], total: 0 };
      }

      // Calculate range (IMAP uses 1-based sequence numbers, newest first)
      const start = Math.max(1, total - offset - limit + 1);
      const end = Math.max(1, total - offset);

      const raw: {
        summary: Omit<EmailSummary, 'intent' | 'confidence'>;
        classify: ClassifiableEmail;
      }[] = [];

      for await (const message of client.fetch(`${start}:${end}`, {
        uid: true,
        flags: true,
        envelope: true,
        bodyStructure: true,
        // Enough to cover headers + the text body for preview and classification;
        // caps huge attachment-laden messages. Text parts precede attachments in
        // MIME order, so the decoded body is captured even when truncated.
        source: { start: 0, maxLength: 65536 },
      })) {
        const from = message.envelope?.from?.[0];
        const parsed = message.source ? await simpleParser(message.source) : null;
        const text = (parsed?.text || '').replace(/\s+/g, ' ').trim();
        const messageId = message.envelope?.messageId || `uid:${message.uid}`;

        raw.push({
          summary: {
            uid: message.uid,
            subject: message.envelope?.subject || '(No subject)',
            from: { name: from?.name || '', address: from?.address || '' },
            date: message.envelope?.date?.toISOString() || '',
            seen: message.flags?.has('\\Seen') || false,
            hasAttachments: hasAttachments(message.bodyStructure),
            preview: text.slice(0, 150),
          },
          classify: {
            messageId,
            subject: message.envelope?.subject || '',
            from: `${from?.name || ''} <${from?.address || ''}>`.trim(),
            body: text,
          },
        });
      }

      // Classify + summarize each email (cache-first) and order by triage
      // priority. The AI one-liner replaces the raw snippet when available.
      const verdicts = await classifyBatch(raw.map((r) => r.classify));
      const emails: EmailSummary[] = raw.map((r) => {
        const v = verdicts.get(r.classify.messageId) ?? {
          intent: 'noise' as Intent,
          confidence: 0,
          summary: '',
        };
        return {
          ...r.summary,
          preview: v.summary || r.summary.preview,
          intent: v.intent,
          confidence: v.confidence,
        };
      });

      logger.info('Emails fetched', { folder, count: emails.length, total });
      return { emails: sortByIntent(emails), total };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function getEmail(uid: number, folder = 'INBOX'): Promise<EmailFull | null> {
  const client = await getClient();

  try {
    const lock = await client.getMailboxLock(folder);

    try {
      const message = await client.fetchOne(
        String(uid),
        {
          uid: true,
          flags: true,
          envelope: true,
          source: true,
        },
        { uid: true }
      );

      if (!message || !message.source) {
        return null;
      }

      const parsed: ParsedMail = await simpleParser(message.source);
      const from = message.envelope?.from?.[0];
      const messageId = message.envelope?.messageId || `uid:${uid}`;
      const verdict = getCachedClassification(messageId) ?? {
        intent: 'noise' as Intent,
        confidence: 0,
      };

      // Mark as seen
      await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });

      logger.info('Email fetched', { uid, subject: parsed.subject });

      return {
        uid: message.uid,
        subject: parsed.subject || '(No subject)',
        from: {
          name: from?.name || '',
          address: from?.address || '',
        },
        to: (parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]) : []).map((t) => ({
          name: (t as any).name || '',
          address: (t as any).address || (t as any).value?.[0]?.address || '',
        })),
        date: message.envelope?.date?.toISOString() || '',
        seen: true,
        hasAttachments: (parsed.attachments?.length || 0) > 0,
        intent: verdict.intent,
        confidence: verdict.confidence,
        preview: parsed.text?.substring(0, 200) || '',
        text: parsed.text || null,
        attachments: (parsed.attachments || []).map((a) => ({
          filename: a.filename || 'attachment',
          contentType: a.contentType,
          size: a.size,
        })),
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function markAsRead(uid: number, folder = 'INBOX'): Promise<void> {
  const client = await getClient();

  try {
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });
      logger.info('Email marked as read', { uid });
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function markAsUnread(uid: number, folder = 'INBOX'): Promise<void> {
  const client = await getClient();

  try {
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageFlagsRemove(String(uid), ['\\Seen'], { uid: true });
      logger.info('Email marked as unread', { uid });
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function deleteEmail(uid: number, folder = 'INBOX'): Promise<void> {
  const client = await getClient();

  try {
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageFlagsAdd(String(uid), ['\\Deleted'], { uid: true });
      await client.messageDelete(String(uid), { uid: true });
      logger.info('Email deleted', { uid });
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function getFolders(): Promise<string[]> {
  const client = await getClient();

  try {
    const folders: string[] = [];
    const list = await client.list();

    for (const folder of list) {
      folders.push(folder.path);
    }

    return folders;
  } finally {
    await client.logout();
  }
}

// Helper: Check if message has attachments
function hasAttachments(bodyStructure: any): boolean {
  if (!bodyStructure) return false;
  if (bodyStructure.disposition === 'attachment') return true;
  if (bodyStructure.childNodes) {
    return bodyStructure.childNodes.some(hasAttachments);
  }
  return false;
}
