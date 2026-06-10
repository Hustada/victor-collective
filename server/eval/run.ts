/**
 * Classifier eval: scores the live model against hand labels in eval-set.json.
 * Bypasses the SQLite cache on purpose — this measures the model + prompt as
 * they are NOW, so re-run it after any prompt, model, or chunk-size change.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  classifyChunkWithClaude,
  CHUNK_SIZE,
  INTENTS,
  type Classification,
  type Intent,
} from '../services/email-classifier.service.js';
import type { EvalItem } from './pull.js';

const SET = path.join(path.dirname(fileURLToPath(import.meta.url)), 'eval-set.json');

async function main(): Promise<void> {
  const all = JSON.parse(fs.readFileSync(SET, 'utf-8')) as EvalItem[];
  const labeled = all.filter((i): i is EvalItem & { label: Intent } =>
    INTENTS.includes(i.label as Intent)
  );
  if (labeled.length === 0) {
    console.error(`No labeled items in ${SET} — fill in "label" fields first.`);
    process.exit(1);
  }
  console.log(
    `Scoring ${labeled.length} labeled emails (${all.length - labeled.length} unlabeled skipped)\n`
  );

  const verdicts: Classification[] = [];
  for (let i = 0; i < labeled.length; i += CHUNK_SIZE) {
    verdicts.push(...(await classifyChunkWithClaude(labeled.slice(i, i + CHUNK_SIZE))));
  }

  let correct = 0;
  const confusion = new Map<string, number>();
  const misses: { item: EvalItem; got: Classification }[] = [];

  labeled.forEach((item, i) => {
    const got = verdicts[i];
    if (got.intent === item.label) correct++;
    else misses.push({ item, got });
    const key = `${item.label} -> ${got.intent}`;
    confusion.set(key, (confusion.get(key) ?? 0) + 1);
  });

  console.log(
    `Accuracy: ${correct}/${labeled.length} (${((correct / labeled.length) * 100).toFixed(1)}%)\n`
  );

  console.log('Per-intent:');
  for (const intent of INTENTS) {
    const ofIntent = labeled.filter((i) => i.label === intent).length;
    const hit = confusion.get(`${intent} -> ${intent}`) ?? 0;
    if (ofIntent > 0) console.log(`  ${intent.padEnd(8)} ${hit}/${ofIntent}`);
  }

  if (misses.length > 0) {
    console.log('\nMisses:');
    for (const { item, got } of misses) {
      console.log(
        `  [${item.label} -> ${got.intent} @${got.confidence.toFixed(2)}] ${item.subject.slice(0, 60)}`
      );
      console.log(`      summary: ${got.summary}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
