/**
 * Live AI activity: what the machine is doing right now, and what it just did.
 *
 * In-memory on purpose — this powers the inbox UI's status ticker and agent
 * console, which only care about the current process. Nothing here is a
 * source of truth; restarts clear it and that's correct.
 */

interface Progress {
  done: number;
  total: number;
}

export interface ActivityEvent {
  at: string; // ISO timestamp
  line: string;
}

export interface Activity {
  classifying: Progress | null;
  drafting: Progress | null;
  log: ActivityEvent[];
}

const LOG_LIMIT = 100;

let classifying: Progress | null = null;
let drafting: Progress | null = null;
let log: ActivityEvent[] = [];

export function noteEvent(line: string): void {
  log.push({ at: new Date().toISOString(), line });
  if (log.length > LOG_LIMIT) log = log.slice(-LOG_LIMIT);
}

export function beginClassifying(total: number): void {
  classifying = { done: 0, total };
}

export function classifiedChunk(count: number): void {
  if (classifying) classifying.done += count;
  noteEvent(`classified ${count} emails`);
}

export function endClassifying(): void {
  classifying = null;
}

export function beginDrafting(total: number): void {
  drafting = { done: 0, total };
}

export function draftedOne(label: string): void {
  if (drafting) drafting.done += 1;
  noteEvent(`draft → ${label}`);
}

export function endDrafting(): void {
  drafting = null;
}

export function getActivity(): Activity {
  return { classifying, drafting, log: [...log] };
}

/** Test hook. */
export function resetActivity(): void {
  classifying = null;
  drafting = null;
  log = [];
}
