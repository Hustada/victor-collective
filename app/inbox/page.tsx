'use client';

/**
 * Portal Inbox — intent-triage email client.
 * Two-pane (list + reading), Obsidian Ember styling. The list is sorted by
 * triage intent server-side; this renders the color rail, filter chips, and
 * reading pane. AI summaries and draft-ahead arrive in later slices.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import Link from 'next/link';
import PortalGate from '../../src/components/PortalGate';
import { palette } from '../../src/theme';

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
}

interface FullEmail extends Email {
  to: EmailAddress[];
  html: string | null;
  text: string | null;
  attachments: { filename: string; contentType: string; size: number }[];
}

const INTENT_ORDER: Intent[] = ['reply', 'money', 'waiting', 'noise'];
const INTENT_META: Record<Intent, { label: string; color: string }> = {
  reply: { label: 'NEEDS REPLY', color: '#FF7A3D' },
  money: { label: 'MONEY', color: '#FF4D4D' },
  waiting: { label: 'WAITING', color: '#7C9CB8' },
  noise: { label: 'NOISE', color: '#6B6B6B' },
};
const FILTERS: ('all' | Intent)[] = ['all', 'reply', 'money', 'waiting', 'noise'];
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 };

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

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inbox');
      if (!res.ok) throw new Error('API not available');
      const data = (await res.json()) as { emails: Email[] };
      setEmails(data.emails);
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'e') {
        archive();
      } else if (e.key === 'Escape' && isMobile) {
        setSelectedUid(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, archive, isMobile]);

  const briefing = `${counts.reply || 0} need you · ${counts.money || 0} money · ${counts.waiting || 0} waiting`;

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
      </div>
    </MotionConfig>
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
  onBack,
}: {
  summary: Email;
  full: FullEmail | null;
  loading: boolean;
  onArchive: () => void;
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

      {/* Draft-ahead placeholder — arrives in the draft-ahead slice */}
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
        <span style={{ color: palette.primary.main }}>⚡</span> Draft reply in your voice — arrives
        with draft-ahead
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <PaneButton label="Archive" hint="E" color={palette.primary.main} onClick={onArchive} />
        <PaneButton label="Snooze" hint="S" color={palette.text.secondary} onClick={() => {}} />
        <PaneButton label="Reply" hint="R" color={m.color} onClick={() => {}} />
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

export default function InboxPage() {
  return (
    <PortalGate>
      <InboxContent />
    </PortalGate>
  );
}
