/**
 * Eval set builder: pulls the latest emails from the real mailbox into
 * eval-set.json for hand-labeling. Fill in each "label" with one of
 * reply | money | waiting | noise, then run `npm run eval:run`.
 *
 * The JSON contains real mail — it is gitignored. Do not commit it.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

const COUNT = 40;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'eval-set.json');

export interface EvalItem {
  messageId: string;
  subject: string;
  from: string;
  body: string;
  label: '' | 'reply' | 'money' | 'waiting' | 'noise';
}

async function main(): Promise<void> {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST || 'mail.privateemail.com',
    port: parseInt(process.env.IMAP_PORT || '993'),
    secure: true,
    auth: { user: process.env.IMAP_USER || '', pass: process.env.IMAP_PASS || '' },
    logger: false,
  });

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');
  try {
    const total = client.mailbox && typeof client.mailbox !== 'boolean' ? client.mailbox.exists : 0;
    const start = Math.max(1, total - COUNT + 1);

    const items: EvalItem[] = [];
    for await (const message of client.fetch(`${start}:*`, {
      uid: true,
      envelope: true,
      source: { start: 0, maxLength: 65536 },
    })) {
      const from = message.envelope?.from?.[0];
      const parsed = message.source ? await simpleParser(message.source) : null;
      const text = (parsed?.text || '').replace(/\s+/g, ' ').trim();
      items.push({
        messageId: message.envelope?.messageId || `uid:${message.uid}`,
        subject: message.envelope?.subject || '(No subject)',
        from: `${from?.name || ''} <${from?.address || ''}>`.trim(),
        // Same body the production classifier sees (it slices to 2000 itself).
        body: text.slice(0, 2000),
        label: '',
      });
    }

    fs.writeFileSync(OUT, JSON.stringify(items.reverse(), null, 2));
    console.log(`Wrote ${items.length} emails to ${OUT}`);
    console.log('Label each item (reply | money | waiting | noise), then: npm run eval:run');
  } finally {
    lock.release();
    await client.logout();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
