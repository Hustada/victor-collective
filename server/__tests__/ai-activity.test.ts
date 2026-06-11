import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  beginClassifying,
  classifiedChunk,
  endClassifying,
  beginDrafting,
  draftedOne,
  endDrafting,
  noteEvent,
  getActivity,
  resetActivity,
} from '../lib/ai-activity.js';

beforeEach(() => {
  resetActivity();
});

describe('ai activity tracker', () => {
  it('is idle with an empty log by default', () => {
    expect(getActivity()).toEqual({ classifying: null, drafting: null, log: [] });
  });

  it('tracks classification progress chunk by chunk', () => {
    beginClassifying(31);
    expect(getActivity().classifying).toEqual({ done: 0, total: 31 });

    classifiedChunk(15);
    classifiedChunk(15);
    expect(getActivity().classifying).toEqual({ done: 30, total: 31 });

    endClassifying();
    expect(getActivity().classifying).toBeNull();
  });

  it('tracks drafting progress with one log line per draft', () => {
    beginDrafting(2);
    draftedOne('Re: DNS setup');
    draftedOne('Account Disabled');
    endDrafting();

    expect(getActivity().drafting).toBeNull();
    const lines = getActivity().log.map((e) => e.line);
    expect(lines).toContain('draft → Re: DNS setup');
    expect(lines).toContain('draft → Account Disabled');
  });

  it('records ad-hoc events with timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-11T20:41:03Z'));
    noteEvent('briefing synthesized');
    vi.useRealTimers();

    expect(getActivity().log).toEqual([
      { at: '2026-06-11T20:41:03.000Z', line: 'briefing synthesized' },
    ]);
  });

  it('keeps only the most recent log entries', () => {
    for (let i = 0; i < 250; i++) noteEvent(`event ${i}`);
    const log = getActivity().log;
    expect(log.length).toBe(100);
    expect(log[log.length - 1].line).toBe('event 249');
    expect(log[0].line).toBe('event 150');
  });
});
