'use client';

/**
 * THROWAWAY PROTOTYPE — Traditional inbox, elevated. List + reading pane,
 * Obsidian Ember styling, with the new AI features: intent rail + smart sort,
 * AI summary lines, draft-ahead, briefing bar, keyboard nav.
 * Comparison piece for /lab/altitude and /lab/deck.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { palette } from '@/theme';

type Intent = 'reply' | 'money' | 'waiting' | 'noise';

interface Email {
  id: string;
  sender: string;
  subject: string;
  summary: string; // AI one-liner
  body: string;
  draft: string | null; // draft-ahead reply, in-voice
  intent: Intent;
  age: string;
  urgency: number;
  unread: boolean;
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

function initials(name: string): string {
  const parts = name
    .replace(/[·•].*$/, '')
    .trim()
    .split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '@';
}

const EMAILS: Email[] = [
  {
    id: 'e1',
    sender: 'Chris Johnson',
    subject: 'Re: Strategic Edge Platform',
    summary: 'Wants to meet this week + training on the leads view',
    body: 'Hey Mark — can we get together this week? I’ll definitely need some training. When I clicked on several leads, the system pulled them up but I wasn’t sure what to do next. THANK YOU+++',
    draft:
      'Hey Chris — this week works. How’s Thursday at 10? I’ll walk you through the leads view end to end and we’ll cover what to do after a lead opens. — Mark',
    intent: 'reply',
    age: '2h',
    urgency: 0.9,
    unread: true,
  },
  {
    id: 'e4',
    sender: 'Billing · Stripe',
    subject: 'Invoice TVC-001 is unpaid',
    summary: 'Invoice TVC-001 ($3,800) overdue 6 days',
    body: 'Invoice TVC-001 for $3,800 has been outstanding for 6 days. Consider sending a reminder.',
    draft: null,
    intent: 'money',
    age: '6d',
    urgency: 0.95,
    unread: true,
  },
  {
    id: 'e2',
    sender: 'Marc Huff',
    subject: 'Re: DNS',
    summary: 'Needs the exact SPF record value to add',
    body: 'It’d be considerably faster if you let me know what SPF record you need added. It’s not that I can’t — I just need the exact value.',
    draft:
      'Marc — here’s the record: v=spf1 include:_spf.resend.com ~all. Add it as a TXT on the root. Thanks!',
    intent: 'reply',
    age: '5h',
    urgency: 0.7,
    unread: false,
  },
  {
    id: 'e3',
    sender: 'Dana Whitfield',
    subject: 'Proposal follow-up',
    summary: 'Liked the deck, asking for next steps',
    body: 'Loved the deck you sent over. What’s the next step to get started? Happy to hop on a call.',
    draft:
      'Dana — glad it landed. Next step is a 30-min scoping call; I’ll send a couple times. Looking forward to it. — Mark',
    intent: 'reply',
    age: '1d',
    urgency: 0.55,
    unread: false,
  },
  {
    id: 'e5',
    sender: 'Stripe',
    subject: 'Payout sent',
    summary: '$4,120 payout on its way to your bank',
    body: 'A payout of $4,120.00 is on its way to your bank account ending 4429.',
    draft: null,
    intent: 'money',
    age: '1d',
    urgency: 0.35,
    unread: false,
  },
  {
    id: 'e6',
    sender: 'Acme Vendor',
    subject: 'Re: contract redlines',
    summary: 'Their legal reviewing, back to you Friday',
    body: 'Thanks for the redlines. Our legal team is reviewing and we’ll be back to you by Friday.',
    draft: null,
    intent: 'waiting',
    age: '3d',
    urgency: 0.3,
    unread: false,
  },
  {
    id: 'e7',
    sender: 'Priya Nair',
    subject: 'Re: scheduling',
    summary: 'Confirming times with her team soon',
    body: 'Checking with my team on the times you proposed. Will confirm soon.',
    draft: null,
    intent: 'waiting',
    age: '2d',
    urgency: 0.3,
    unread: false,
  },
  {
    id: 'e8',
    sender: 'PairVia',
    subject: 'You’re invited to join PairVia',
    summary: 'Product invite — likely ignorable',
    body: 'Start collaborating with your team today on PairVia.',
    draft: null,
    intent: 'noise',
    age: '12h',
    urgency: 0.08,
    unread: true,
  },
  {
    id: 'e9',
    sender: 'LinkedIn',
    subject: 'You appeared in 9 searches',
    summary: 'Weekly profile stats',
    body: 'You appeared in 9 searches this week.',
    draft: null,
    intent: 'noise',
    age: '1d',
    urgency: 0.08,
    unread: false,
  },
  {
    id: 'e10',
    sender: 'Substack',
    subject: 'The week in AI',
    summary: 'Newsletter digest',
    body: 'Five things that happened while you were building.',
    draft: null,
    intent: 'noise',
    age: '2d',
    urgency: 0.08,
    unread: false,
  },
  {
    id: 'e11',
    sender: 'Taylor Reed',
    subject: 'Quick question on scope',
    summary: 'Asking whether the retainer covers mobile',
    body: 'Hey Mark — does the monthly retainer cover the mobile build too, or is that scoped separately? Want to set expectations with my team.',
    draft:
      'Taylor — mobile is scoped separately from the retainer; happy to send a quick add-on estimate. Want me to put numbers together? — Mark',
    intent: 'reply',
    age: '7h',
    urgency: 0.65,
    unread: true,
  },
  {
    id: 'e12',
    sender: 'AWS Billing',
    subject: 'Your invoice is available',
    summary: 'AWS bill $312.44 this cycle',
    body: 'Your AWS invoice for the current billing cycle is $312.44 and is now available.',
    draft: null,
    intent: 'money',
    age: '2d',
    urgency: 0.4,
    unread: false,
  },
  {
    id: 'e13',
    sender: 'GitHub',
    subject: '3 pull requests need review',
    summary: 'CI passing, awaiting your review',
    body: 'You have 3 pull requests assigned for review across your repositories.',
    draft: null,
    intent: 'noise',
    age: '4h',
    urgency: 0.08,
    unread: true,
  },
  {
    id: 'e14',
    sender: 'Vercel',
    subject: 'Deployment ready',
    summary: 'Production deploy succeeded',
    body: 'Your latest production deployment completed successfully.',
    draft: null,
    intent: 'noise',
    age: '1d',
    urgency: 0.08,
    unread: false,
  },
  {
    id: 'e15',
    sender: 'Henry Vu',
    subject: 'Re: partnership idea',
    summary: 'Following up on the integration chat',
    body: 'Circling back on the integration idea we discussed — still interested on our end. When are you free to dig in?',
    draft:
      'Henry — still interested here too. I’ve got Wed afternoon or Fri morning open. Send what works and I’ll lock it. — Mark',
    intent: 'reply',
    age: '1d',
    urgency: 0.5,
    unread: false,
  },
  {
    id: 'e16',
    sender: 'Notion',
    subject: 'Weekly digest',
    summary: 'Workspace activity summary',
    body: 'Here’s what happened in your workspace this week.',
    draft: null,
    intent: 'noise',
    age: '3d',
    urgency: 0.08,
    unread: false,
  },
  {
    id: 'e17',
    sender: 'Figma',
    subject: 'New comment on your file',
    summary: 'Someone commented on Portal v2',
    body: 'A new comment was left on your file "Portal v2".',
    draft: null,
    intent: 'noise',
    age: '3d',
    urgency: 0.08,
    unread: false,
  },
  {
    id: 'e18',
    sender: 'Wells Fargo',
    subject: 'Statement ready',
    summary: 'Business account statement available',
    body: 'Your business account statement is ready to view.',
    draft: null,
    intent: 'noise',
    age: '4d',
    urgency: 0.08,
    unread: false,
  },
  {
    id: 'e19',
    sender: 'Jordan Blake',
    subject: 'Re: contract',
    summary: 'Signed — waiting on your countersign',
    body: 'Signed our copy and sent it over. Just waiting on your countersignature to make it official.',
    draft: null,
    intent: 'waiting',
    age: '2d',
    urgency: 0.3,
    unread: false,
  },
  {
    id: 'e20',
    sender: 'Product Hunt',
    subject: 'Today’s top launches',
    summary: 'Daily product roundup',
    body: 'The products everyone’s talking about today.',
    draft: null,
    intent: 'noise',
    age: '5d',
    urgency: 0.08,
    unread: false,
  },
];

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

export default function InboxPrototype() {
  const isMobile = useIsMobile();
  const [emails, setEmails] = useState<Email[]>(EMAILS);
  const [filter, setFilter] = useState<'all' | Intent>('all');
  const [selectedId, setSelectedId] = useState<string | null>('e1');

  const sorted = useMemo(
    () =>
      [...emails].sort(
        (a, b) =>
          INTENT_ORDER.indexOf(a.intent) - INTENT_ORDER.indexOf(b.intent) || b.urgency - a.urgency
      ),
    [emails]
  );
  const visible = filter === 'all' ? sorted : sorted.filter((e) => e.intent === filter);
  const selected = emails.find((e) => e.id === selectedId) || null;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: emails.length };
    for (const i of INTENT_ORDER) c[i] = emails.filter((e) => e.intent === i).length;
    return c;
  }, [emails]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, unread: false } : e)));
  }, []);

  const archive = useCallback(() => {
    if (!selected) return;
    const idx = visible.findIndex((e) => e.id === selected.id);
    const next = visible[idx + 1]?.id || visible[idx - 1]?.id || null;
    setEmails((prev) => prev.filter((e) => e.id !== selected.id));
    setSelectedId(next);
  }, [selected, visible]);

  const move = useCallback(
    (dir: 1 | -1) => {
      if (visible.length === 0) return;
      const idx = selectedId ? visible.findIndex((e) => e.id === selectedId) : -1;
      const next = visible[(idx + dir + visible.length) % visible.length];
      if (next) select(next.id);
    },
    [visible, selectedId, select]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      }
      if (e.key === 'e') archive();
      if (e.key === 'Escape' && isMobile) setSelectedId(null);
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
            padding: '16px 24px 12px',
            borderBottom: `1px solid ${palette.border.subtle}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
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
                fontSize: '0.64rem',
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
          {/* List */}
          {(!isMobile || !selected) && (
            <div
              style={{
                flex: isMobile ? 1 : '0 0 380px',
                borderRight: isMobile ? 'none' : `1px solid ${palette.border.subtle}`,
                overflowY: 'auto',
              }}
            >
              {visible.map((email) => {
                const m = INTENT_META[email.intent];
                const isSel = email.id === selectedId;
                return (
                  <button
                    key={email.id}
                    onClick={() => select(email.id)}
                    style={{
                      display: 'flex',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: '13px 16px 13px 13px',
                      borderBottom: `1px solid ${palette.border.subtle}`,
                      borderLeft: `3px solid ${m.color}`,
                      background: isSel ? `${m.color}1c` : 'transparent',
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
                        background: email.unread ? m.color : 'transparent',
                        boxShadow: email.unread ? `0 0 8px ${m.color}` : 'none',
                      }}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span
                          style={{
                            fontWeight: email.unread ? 700 : 500,
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {email.sender}
                        </span>
                        <span
                          style={{
                            flex: '0 0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {email.draft && (
                            <span
                              title="Draft ready"
                              style={{ color: palette.primary.main, fontSize: '0.7rem' }}
                            >
                              ⚡
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '0.56rem',
                              color: palette.text.muted,
                            }}
                          >
                            {email.age}
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
                        {email.summary}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Reading pane */}
          {(!isMobile || selected) && (
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={SPRING}
                  >
                    <ReadingPane
                      email={selected}
                      onArchive={archive}
                      onBack={isMobile ? () => setSelectedId(null) : undefined}
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
                    SELECT A MESSAGE
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

function ReadingPane({
  email,
  onArchive,
  onBack,
}: {
  email: Email;
  onArchive: () => void;
  onBack?: () => void;
}) {
  const m = INTENT_META[email.intent];
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
            boxShadow: `0 0 ${10 + email.urgency * 22}px ${m.color}`,
          }}
        >
          {initials(email.sender)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '1.02rem' }}>{email.sender}</div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.16em',
              color: m.color,
            }}
          >
            {m.label} · {email.age}
          </div>
        </div>
      </div>

      <h1 style={{ margin: '0 0 18px', fontSize: '1.5rem', fontWeight: 600 }}>{email.subject}</h1>
      <p style={{ margin: 0, color: palette.text.secondary, lineHeight: 1.7, fontSize: '0.97rem' }}>
        {email.body}
      </p>

      {/* Draft-ahead */}
      <div
        style={{
          marginTop: 26,
          borderRadius: 12,
          border: `1px solid ${email.draft ? `${palette.primary.main}55` : palette.border.default}`,
          background: email.draft ? `${palette.primary.main}0d` : 'transparent',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderBottom: `1px solid ${palette.border.subtle}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.14em',
            color: palette.primary.main,
          }}
        >
          <span>⚡</span>{' '}
          {email.draft ? 'DRAFT — IN YOUR VOICE' : 'NO DRAFT (FYI / NO REPLY NEEDED)'}
        </div>
        {email.draft && (
          <>
            <div
              style={{
                padding: '14px 16px',
                color: palette.text.primary,
                lineHeight: 1.6,
                fontSize: '0.92rem',
              }}
            >
              {email.draft}
            </div>
            <div
              style={{
                padding: '10px 14px',
                display: 'flex',
                gap: 8,
                borderTop: `1px solid ${palette.border.subtle}`,
              }}
            >
              <PaneButton label="Send" hint="⌘↵" color={palette.primary.main} solid />
              <PaneButton label="Edit" color={palette.text.secondary} />
              <PaneButton label="Regenerate" color={palette.text.secondary} />
            </div>
          </>
        )}
      </div>

      {/* Action toolbar */}
      <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
        <PaneButton label="Archive" hint="E" color={palette.primary.main} onClick={onArchive} />
        <PaneButton label="Snooze" hint="S" color={palette.text.secondary} onClick={onArchive} />
        <PaneButton label="Reply" hint="R" color={m.color} />
      </div>
    </div>
  );
}

function PaneButton({
  label,
  hint,
  color,
  solid,
  onClick,
}: {
  label: string;
  hint?: string;
  color: string;
  solid?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: solid ? color : `${color}1a` }}
      whileTap={{ scale: 0.97 }}
      style={{
        cursor: 'pointer',
        padding: '9px 14px',
        borderRadius: 8,
        border: `1px solid ${color}66`,
        background: solid ? color : 'transparent',
        color: solid ? '#0d0b09' : color,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.66rem',
        letterSpacing: '0.08em',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span>{label}</span>
      {hint && <span style={{ opacity: 0.6 }}>{hint}</span>}
    </motion.button>
  );
}
