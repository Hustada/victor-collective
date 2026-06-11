'use client';

/**
 * Portal Inbox — intent-triage email client.
 * Two-pane (list + reading), Obsidian Ember styling. The list is sorted by
 * triage intent server-side; this renders the color rail, filter chips, and
 * reading pane. AI summaries and draft-ahead arrive in later slices.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import Link from 'next/link';
import PortalGate from '../../src/components/PortalGate';
import { palette } from '../../src/theme';
import { SPRING, fadeUp, popIn, emberPulse, slideUp, consoleLine } from '../../src/lib/motion';

type Intent = 'reply' | 'money' | 'waiting' | 'noise';

interface EmailAddress {
  name: string;
  address: string;
}

interface Email {
  uid: number;
  subject: string;
  from: EmailAddress;
  date: string;
  seen: boolean;
  hasAttachments: boolean;
  preview: string;
  intent: Intent;
  confidence: number;
  hasDraft: boolean;
}

interface Draft {
  body: string;
  originalBody: string;
  model: string;
  state: 'generated' | 'edited' | 'sent';
}

interface FullEmail extends Email {
  messageId: string;
  to: EmailAddress[];
  text: string | null;
  attachments: { filename: string; contentType: string; size: number }[];
  draft: Draft | null;
}

interface Activity {
  classifying: { done: number; total: number } | null;
  drafting: { done: number; total: number } | null;
  log: { at: string; line: string }[];
}

const INTENT_ORDER: Intent[] = ['reply', 'money', 'waiting', 'noise'];
const INTENT_META: Record<Intent, { label: string; color: string }> = {
  reply: { label: 'NEEDS REPLY', color: '#FF7A3D' },
  money: { label: 'MONEY', color: '#FF4D4D' },
  waiting: { label: 'WAITING', color: '#7C9CB8' },
  noise: { label: 'NOISE', color: '#6B6B6B' },
};
const FILTERS: ('all' | Intent)[] = ['all', 'reply', 'money', 'waiting', 'noise'];

function senderName(from: EmailAddress): string {
  return from.name || from.address || '(unknown)';
}

function initials(from: EmailAddress): string {
  const name = senderName(from)
    .replace(/[·•<].*$/, '')
    .trim();
  const parts = name.split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '@';
}

function relativeAge(iso: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

function InboxContent() {
  const isMobile = useIsMobile();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiDown, setApiDown] = useState(false);
  const [filter, setFilter] = useState<'all' | Intent>('all');
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const [full, setFull] = useState<FullEmail | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [composer, setComposer] = useState<{
    to: string;
    subject: string;
    body: string;
    uid?: number;
    messageId?: string;
  } | null>(null);
  const [sentNote, setSentNote] = useState(false);
  const [aiBriefing, setAiBriefing] = useState('');
  const [activity, setActivity] = useState<Activity | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);

  // Quiet refreshes — no skeleton, no selection steal. Used when a background
  // draft run finishes so the ⚡ bolts (and the open email's draft) land in place.
  const selectedUidRef = useRef<number | null>(null);
  useEffect(() => {
    selectedUidRef.current = selectedUid;
  }, [selectedUid]);

  const refreshSilently = useCallback(async () => {
    try {
      const res = await fetch('/api/inbox');
      if (!res.ok) return;
      const data = (await res.json()) as { emails: Email[]; briefing?: string };
      setEmails(data.emails);
      setAiBriefing(data.briefing || '');
    } catch {
      // next poll catches up
    }
    const uid = selectedUidRef.current;
    if (uid === null) return;
    try {
      const res = await fetch(`/api/inbox/${uid}`);
      // Guard: only apply if this email is still the one on screen.
      if (res.ok && selectedUidRef.current === uid) {
        setFull((await res.json()) as FullEmail);
      }
    } catch {
      // pane keeps what it has
    }
  }, []);

  // Live AI activity: poll while the page is open; one quiet refetch when a
  // draft run completes (refetching during the run would re-hit IMAP per poll).
  useEffect(() => {
    let drafting = false;
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch('/api/inbox/activity');
        if (!res.ok || !alive) return;
        const a = (await res.json()) as Activity;
        setActivity(a);
        const draftingNow = a.drafting !== null;
        if (drafting && !draftingNow) refreshSilently();
        drafting = draftingNow;
      } catch {
        // API down — the main fetch path already surfaces that
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [refreshSilently]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inbox');
      if (!res.ok) throw new Error('API not available');
      const data = (await res.json()) as { emails: Email[]; briefing?: string };
      setEmails(data.emails);
      setAiBriefing(data.briefing || '');
      setApiDown(false);
      if (!isMobile && data.emails.length > 0) setSelectedUid(data.emails[0].uid);
    } catch {
      setApiDown(true);
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const visible = filter === 'all' ? emails : emails.filter((e) => e.intent === filter);
  const selected = emails.find((e) => e.uid === selectedUid) || null;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: emails.length };
    for (const i of INTENT_ORDER) c[i] = emails.filter((e) => e.intent === i).length;
    return c;
  }, [emails]);

  const select = useCallback(async (uid: number) => {
    setSelectedUid(uid);
    setFull(null);
    setLoadingFull(true);
    setEmails((prev) => prev.map((e) => (e.uid === uid ? { ...e, seen: true } : e)));
    try {
      const res = await fetch(`/api/inbox/${uid}`);
      if (res.ok) setFull((await res.json()) as FullEmail);
    } catch {
      // reading pane falls back to the list preview
    } finally {
      setLoadingFull(false);
    }
  }, []);

  const archive = useCallback(() => {
    if (selectedUid === null) return;
    const idx = visible.findIndex((e) => e.uid === selectedUid);
    const next = visible[idx + 1]?.uid ?? visible[idx - 1]?.uid ?? null;
    setEmails((prev) => prev.filter((e) => e.uid !== selectedUid));
    setSelectedUid(next);
    if (next !== null) select(next);
    else setFull(null);
  }, [selectedUid, visible, select]);

  const move = useCallback(
    (dir: 1 | -1) => {
      if (visible.length === 0) return;
      const idx = selectedUid ? visible.findIndex((e) => e.uid === selectedUid) : -1;
      const next = visible[(idx + dir + visible.length) % visible.length];
      if (next) select(next.uid);
    },
    [visible, selectedUid, select]
  );

  const openReply = useCallback(() => {
    if (!selected) return;
    const subject = /^re:/i.test(selected.subject) ? selected.subject : `Re: ${selected.subject}`;
    // The pre-written draft, when the open email's full payload carries one.
    const loaded = full && full.uid === selected.uid ? full : null;
    setComposer({
      to: selected.from.address,
      subject,
      body: loaded?.draft?.body ?? '',
      uid: selected.uid,
      messageId: loaded?.messageId,
    });
  }, [selected, full]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Bare keys only — Cmd+R is the browser's refresh, not our reply.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'e') {
        archive();
      } else if (e.key === 'r') {
        e.preventDefault();
        openReply();
      } else if (e.key === 'Escape' && isMobile) {
        setSelectedUid(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, archive, openReply, isMobile]);

  // Synthesized stand-up when the server has one; counts as the fallback.
  const briefing =
    aiBriefing ||
    `${counts.reply || 0} need you · ${counts.money || 0} money · ${counts.waiting || 0} waiting`;

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          background: palette.background.base,
          color: palette.text.primary,
          fontFamily: '"Space Grotesk", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            flex: '0 0 auto',
            padding: '14px 22px 12px',
            borderBottom: `1px solid ${palette.border.subtle}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/portal"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.18em',
                color: palette.text.muted,
                textDecoration: 'none',
              }}
            >
              ◂ PORTAL
            </Link>
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.25em',
                color: palette.primary.main,
              }}
            >
              INBOX
            </span>
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.12em',
                color: palette.text.muted,
              }}
            >
              ⚡ {briefing}
            </span>
            <AnimatePresence>
              {(activity?.classifying || activity?.drafting) && (
                <motion.span
                  {...fadeUp}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.14em',
                    color: palette.primary.main,
                  }}
                >
                  <motion.span
                    animate={emberPulse.animate}
                    transition={emberPulse.transition}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: palette.primary.main,
                      boxShadow: `0 0 8px ${palette.primary.main}`,
                    }}
                  />
                  {[
                    activity.classifying &&
                      `classifying ${activity.classifying.done}/${activity.classifying.total}`,
                    activity.drafting &&
                      `drafting ${activity.drafting.done}/${activity.drafting.total}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => {
              const active = filter === f;
              const color = f === 'all' ? palette.primary.main : INTENT_META[f].color;
              const label = f === 'all' ? 'ALL' : INTENT_META[f].label;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    cursor: 'pointer',
                    padding: '5px 11px',
                    borderRadius: 20,
                    border: `1px solid ${active ? color : palette.border.default}`,
                    background: active ? `${color}22` : 'transparent',
                    color: active ? color : palette.text.secondary,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  {label} · {counts[f] || 0}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {(!isMobile || !selected) && (
            <div
              style={{
                flex: isMobile ? 1 : '0 0 380px',
                borderRight: isMobile ? 'none' : `1px solid ${palette.border.subtle}`,
                overflowY: 'auto',
              }}
            >
              {loading ? (
                <ListSkeleton />
              ) : apiDown ? (
                <EmptyState text="API server required — run npm run dev:all" />
              ) : visible.length === 0 ? (
                <EmptyState text="Inbox clear" />
              ) : (
                visible.map((email) => (
                  <ListRow
                    key={email.uid}
                    email={email}
                    selected={email.uid === selectedUid}
                    onClick={() => select(email.uid)}
                  />
                ))
              )}
            </div>
          )}

          {(!isMobile || selected) && (
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.uid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={SPRING}
                  >
                    <ReadingPane
                      summary={selected}
                      full={full}
                      loading={loadingFull}
                      onArchive={archive}
                      onReply={openReply}
                      onBack={isMobile ? () => setSelectedUid(null) : undefined}
                    />
                  </motion.div>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      color: palette.text.muted,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.72rem',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {loading ? '' : 'SELECT A MESSAGE'}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatePresence>
          {composer && (
            <Composer
              initial={composer}
              onClose={(sent) => {
                setComposer(null);
                if (sent) {
                  setSentNote(true);
                  window.setTimeout(() => setSentNote(false), 2500);
                }
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sentNote && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1400,
                padding: '10px 18px',
                borderRadius: 8,
                background: palette.background.elevated,
                border: `1px solid ${palette.primary.main}55`,
                color: palette.primary.main,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
              }}
            >
              ✓ SENT
            </motion.div>
          )}
        </AnimatePresence>

        <AgentConsole
          activity={activity}
          open={consoleOpen}
          onToggle={() => setConsoleOpen((o) => !o)}
        />
      </div>
    </MotionConfig>
  );
}

/**
 * Agent console: the operator-room view of everything the machine does —
 * classify chunks, drafts, briefings — as a timestamped mono-font feed.
 */
function AgentConsole({
  activity,
  open,
  onToggle,
}: {
  activity: Activity | null;
  open: boolean;
  onToggle: () => void;
}) {
  const working = Boolean(activity?.classifying || activity?.drafting);
  const log = activity?.log ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [log.length, open]);

  return (
    <div
      style={{
        position: 'absolute',
        right: 18,
        bottom: 16,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            {...slideUp}
            ref={scrollRef}
            style={{
              width: 'min(420px, 92vw)',
              maxHeight: 240,
              overflowY: 'auto',
              background: palette.background.elevated,
              border: `1px solid ${palette.border.default}`,
              borderRadius: 10,
              padding: '10px 14px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.64rem',
              lineHeight: 1.9,
              color: palette.text.secondary,
              boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
            }}
          >
            {log.length === 0 ? (
              <span style={{ color: palette.text.muted }}>{`// quiet. nothing in flight.`}</span>
            ) : (
              log.slice(-30).map((e) => (
                <motion.div key={`${e.at}-${e.line}`} {...consoleLine}>
                  <span style={{ color: palette.text.muted }}>
                    {new Date(e.at).toLocaleTimeString([], { hour12: false })}
                  </span>{' '}
                  {e.line}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onToggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: '7px 13px',
          borderRadius: 20,
          border: `1px solid ${working ? `${palette.primary.main}66` : palette.border.default}`,
          background: palette.background.elevated,
          color: working ? palette.primary.main : palette.text.muted,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.16em',
        }}
      >
        {working ? (
          <motion.span
            animate={emberPulse.animate}
            transition={emberPulse.transition}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: palette.primary.main,
              boxShadow: `0 0 8px ${palette.primary.main}`,
            }}
          />
        ) : (
          <span
            style={{ width: 6, height: 6, borderRadius: '50%', background: palette.text.muted }}
          />
        )}
        {'// AGENT'}
      </button>
    </div>
  );
}

function ListRow({
  email,
  selected,
  onClick,
}: {
  email: Email;
  selected: boolean;
  onClick: () => void;
}) {
  const m = INTENT_META[email.intent];
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '13px 16px 13px 13px',
        borderBottom: `1px solid ${palette.border.subtle}`,
        borderLeft: `3px solid ${m.color}`,
        background: selected ? `${m.color}1c` : 'transparent',
        color: palette.text.primary,
        transition: 'background 0.15s ease',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          marginTop: 5,
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: email.seen ? 'transparent' : m.color,
          boxShadow: email.seen ? 'none' : `0 0 8px ${m.color}`,
        }}
      />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span
            style={{
              fontWeight: email.seen ? 500 : 700,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {senderName(email.from)}
          </span>
          <span style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {email.hasDraft && (
              <motion.span
                {...popIn}
                title="Draft ready"
                style={{ color: palette.primary.main, fontSize: '0.7rem' }}
              >
                ⚡
              </motion.span>
            )}
            {email.hasAttachments && (
              <span style={{ color: palette.text.muted, fontSize: '0.7rem' }}>📎</span>
            )}
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.56rem',
                color: palette.text.muted,
              }}
            >
              {relativeAge(email.date)}
            </span>
          </span>
        </span>
        <span
          style={{
            display: 'block',
            fontSize: '0.84rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: 1,
          }}
        >
          {email.subject}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: '0.74rem',
            color: m.color,
            opacity: 0.85,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: 3,
          }}
        >
          {email.preview || '—'}
        </span>
      </span>
    </button>
  );
}

function ReadingPane({
  summary,
  full,
  loading,
  onArchive,
  onReply,
  onBack,
}: {
  summary: Email;
  full: FullEmail | null;
  loading: boolean;
  onArchive: () => void;
  onReply: () => void;
  onBack?: () => void;
}) {
  const m = INTENT_META[summary.intent];
  const body = full?.text ?? summary.preview;
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 48px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: `1px solid ${palette.border.default}`,
              background: 'transparent',
              color: palette.text.secondary,
              cursor: 'pointer',
            }}
          >
            ←
          </button>
        )}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: '#0d0b09',
            background: m.color,
            boxShadow: `0 0 ${10 + summary.confidence * 22}px ${m.color}`,
          }}
        >
          {initials(summary.from)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '1.02rem' }}>{senderName(summary.from)}</div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.16em',
              color: m.color,
            }}
          >
            {m.label} · {relativeAge(summary.date)}
          </div>
        </div>
      </div>

      <h1 style={{ margin: '0 0 18px', fontSize: '1.5rem', fontWeight: 600 }}>{summary.subject}</h1>

      {loading && !full ? (
        <div
          style={{
            color: palette.text.muted,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.72rem',
          }}
        >
          Loading…
        </div>
      ) : (
        <p
          style={{
            margin: 0,
            color: palette.text.secondary,
            lineHeight: 1.7,
            fontSize: '0.97rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {body}
        </p>
      )}

      {full?.attachments && full.attachments.length > 0 && (
        <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {full.attachments.map((a, i) => (
            <span
              key={i}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.66rem',
                color: palette.text.secondary,
                border: `1px solid ${palette.border.default}`,
                borderRadius: 6,
                padding: '4px 8px',
              }}
            >
              📎 {a.filename}
            </span>
          ))}
        </div>
      )}

      {full?.draft ? (
        <button
          onClick={onReply}
          style={{
            marginTop: 26,
            padding: 14,
            borderRadius: 10,
            border: `1px solid ${palette.primary.main}44`,
            background: `${palette.primary.main}0d`,
            color: palette.text.secondary,
            fontSize: '0.84rem',
            lineHeight: 1.55,
            textAlign: 'left',
            width: '100%',
            cursor: 'pointer',
            whiteSpace: 'pre-wrap',
          }}
        >
          <span
            style={{
              display: 'block',
              marginBottom: 8,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              color: palette.primary.main,
            }}
          >
            ⚡ DRAFT READY — R TO REVIEW
          </span>
          {full.draft.body}
        </button>
      ) : (
        (summary.intent === 'reply' || summary.intent === 'money') && (
          <div
            style={{
              marginTop: 26,
              padding: 14,
              borderRadius: 10,
              border: `1px dashed ${palette.border.default}`,
              color: palette.text.muted,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ color: palette.primary.main }}>⚡</span>{' '}
            {summary.hasDraft ? 'Loading your draft…' : 'Drafting a reply in your voice…'}
          </div>
        )
      )}

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <PaneButton label="Archive" hint="E" color={palette.primary.main} onClick={onArchive} />
        <PaneButton label="Snooze" hint="S" color={palette.text.secondary} onClick={() => {}} />
        <PaneButton label="Reply" hint="R" color={m.color} onClick={onReply} />
      </div>
    </div>
  );
}

function PaneButton({
  label,
  hint,
  color,
  onClick,
}: {
  label: string;
  hint: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: `${color}1a` }}
      whileTap={{ scale: 0.97 }}
      style={{
        cursor: 'pointer',
        padding: '9px 14px',
        borderRadius: 8,
        border: `1px solid ${color}66`,
        background: 'transparent',
        color,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.66rem',
        letterSpacing: '0.08em',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.6 }}>{hint}</span>
    </motion.button>
  );
}

function ListSkeleton() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${palette.border.subtle}`,
            borderLeft: `3px solid ${palette.border.default}`,
          }}
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.05 }}
          >
            <div
              style={{
                height: 10,
                width: '40%',
                background: palette.border.default,
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 10,
                width: '70%',
                background: palette.border.default,
                borderRadius: 4,
              }}
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: 40,
        textAlign: 'center',
        color: palette.text.muted,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.72rem',
        letterSpacing: '0.1em',
      }}
    >
      {text}
    </div>
  );
}

function Composer({
  initial,
  onClose,
}: {
  initial: { to: string; subject: string; body: string; uid?: number; messageId?: string };
  onClose: (sent: boolean) => void;
}) {
  const [to, setTo] = useState(initial.to);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regenerate = async () => {
    if (initial.uid === undefined) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/inbox/${initial.uid}/draft`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate draft');
      const data = (await res.json()) as { draft: { body: string } };
      setBody(data.draft.body);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRegenerating(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${palette.border.default}`,
    background: palette.background.base,
    color: palette.text.primary,
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
  };

  const send = async () => {
    if (!to || !subject || !body) {
      setError('To, subject, and body are all required.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/inbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, messageId: initial.messageId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Failed to send');
      }
      onClose(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onClose(false)}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(6,5,4,0.72)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14 }}
        transition={SPRING}
        style={{
          width: 'min(620px, 94vw)',
          borderRadius: 14,
          border: `1px solid ${palette.border.default}`,
          background: palette.background.elevated,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.2em',
            color: palette.primary.main,
          }}
        >
          REPLY
        </div>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
          style={fieldStyle}
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          style={fieldStyle}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply…"
          rows={9}
          autoFocus
          style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }}
        />
        {error && <div style={{ color: '#FF6B6B', fontSize: '0.78rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
          <span
            style={{
              flex: 1,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.58rem',
              color: palette.text.muted,
            }}
          >
            sends for real via Resend
          </span>
          {initial.uid !== undefined && (
            <button
              onClick={regenerate}
              disabled={regenerating || sending}
              style={{
                cursor: regenerating ? 'default' : 'pointer',
                padding: '9px 16px',
                borderRadius: 8,
                border: `1px solid ${palette.primary.main}66`,
                background: 'transparent',
                color: palette.primary.main,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
                opacity: regenerating ? 0.6 : 1,
              }}
            >
              {regenerating ? 'Drafting…' : body ? '⚡ Regenerate' : '⚡ Draft'}
            </button>
          )}
          <button
            onClick={() => onClose(false)}
            style={{
              cursor: 'pointer',
              padding: '9px 16px',
              borderRadius: 8,
              border: `1px solid ${palette.border.default}`,
              background: 'transparent',
              color: palette.text.secondary,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={send}
            disabled={sending}
            style={{
              cursor: sending ? 'default' : 'pointer',
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: palette.primary.main,
              color: '#0d0b09',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
              fontWeight: 700,
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function InboxPage() {
  return (
    <PortalGate>
      <InboxContent />
    </PortalGate>
  );
}
