'use client';

/**
 * THROWAWAY PROTOTYPE — Triage Deck. A card stack you flick through one at a
 * time. Comparison piece for /lab/altitude (same theme, different feel).
 *
 * Swipe/drag: left = archive · right = reply · down = snooze (back of deck).
 * Keys: ←/→/↓ or e/r/s. Tap a filmstrip sliver to jump to any card.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { palette } from '@/theme';

type Intent = 'reply' | 'money' | 'waiting' | 'noise';

interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  intent: Intent;
  age: string;
  urgency: number;
}

const INTENT_ORDER: Intent[] = ['reply', 'money', 'waiting', 'noise'];
const INTENT_META: Record<Intent, { label: string; color: string }> = {
  reply: { label: 'NEEDS REPLY', color: '#FF7A3D' },
  money: { label: 'MONEY', color: '#FF4D4D' },
  waiting: { label: 'WAITING ON THEM', color: '#7C9CB8' },
  noise: { label: 'NOISE', color: '#6B6B6B' },
};
const SPRING = { type: 'spring' as const, stiffness: 240, damping: 30 };

const alphaHex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');

function glow(color: string, urgency: number, base: number, max: number): string {
  const a = 0.15 + urgency * 0.6;
  return `0 18px 50px rgba(0,0,0,0.55), 0 0 ${base + urgency * max}px ${color}${alphaHex(a)}`;
}

function initials(name: string): string {
  const parts = name
    .replace(/[·•].*$/, '')
    .trim()
    .split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '@';
}

const RAW: Email[] = [
  {
    id: 'e1',
    sender: 'Chris Johnson',
    subject: 'Re: Strategic Edge Platform',
    body: 'Hey Mark — can we get together this week? I’ll definitely need some training. When I clicked on several leads, the system pulled them up but I wasn’t sure what to do next. THANK YOU+++',
    intent: 'reply',
    age: '2h',
    urgency: 0.9,
  },
  {
    id: 'e4',
    sender: 'Billing · Stripe',
    subject: 'Invoice TVC-001 is unpaid',
    body: 'Invoice TVC-001 for $3,800 has been outstanding for 6 days. Consider sending a reminder.',
    intent: 'money',
    age: '6d',
    urgency: 0.95,
  },
  {
    id: 'e2',
    sender: 'Marc Huff',
    subject: 'Re: DNS',
    body: 'It’d be considerably faster if you let me know what SPF record you need added. It’s not that I can’t — I just need the exact value.',
    intent: 'reply',
    age: '5h',
    urgency: 0.7,
  },
  {
    id: 'e3',
    sender: 'Dana Whitfield',
    subject: 'Proposal follow-up',
    body: 'Loved the deck you sent over. What’s the next step to get started? Happy to hop on a call.',
    intent: 'reply',
    age: '1d',
    urgency: 0.55,
  },
  {
    id: 'e5',
    sender: 'Stripe',
    subject: 'Payout sent',
    body: 'A payout of $4,120.00 is on its way to your bank account ending 4429.',
    intent: 'money',
    age: '1d',
    urgency: 0.35,
  },
  {
    id: 'e6',
    sender: 'Acme Vendor',
    subject: 'Re: contract redlines',
    body: 'Thanks for the redlines. Our legal team is reviewing and we’ll be back to you by Friday.',
    intent: 'waiting',
    age: '3d',
    urgency: 0.3,
  },
  {
    id: 'e7',
    sender: 'Priya Nair',
    subject: 'Re: scheduling',
    body: 'Checking with my team on the times you proposed. Will confirm soon.',
    intent: 'waiting',
    age: '2d',
    urgency: 0.3,
  },
  {
    id: 'e8',
    sender: 'PairVia',
    subject: 'You’re invited to join PairVia',
    body: 'Start collaborating with your team today on PairVia.',
    intent: 'noise',
    age: '12h',
    urgency: 0.08,
  },
  {
    id: 'e9',
    sender: 'LinkedIn',
    subject: 'You appeared in 9 searches',
    body: 'You appeared in 9 searches this week.',
    intent: 'noise',
    age: '1d',
    urgency: 0.08,
  },
  {
    id: 'e10',
    sender: 'Substack',
    subject: 'The week in AI',
    body: 'Five things that happened while you were building.',
    intent: 'noise',
    age: '2d',
    urgency: 0.08,
  },
];

// Deck order: hottest first
const DECK = [...RAW].sort(
  (a, b) => INTENT_ORDER.indexOf(a.intent) - INTENT_ORDER.indexOf(b.intent) || b.urgency - a.urgency
);

type Dir = 'left' | 'right' | 'down';

export default function DeckPrototype() {
  const [deck, setDeck] = useState<Email[]>(DECK);
  const [flying, setFlying] = useState<{ id: string; dir: Dir } | null>(null);
  const [burst, setBurst] = useState<{ color: string; key: number } | null>(null);
  const busy = useRef(false);

  const total = DECK.length;
  const top = deck[0] || null;

  const act = useCallback(
    (kind: 'archive' | 'reply' | 'snooze') => {
      if (busy.current || deck.length === 0) return;
      busy.current = true;
      const card = deck[0];
      const dir: Dir = kind === 'archive' ? 'left' : kind === 'reply' ? 'right' : 'down';
      setFlying({ id: card.id, dir });
      if (kind === 'archive')
        setBurst({ color: INTENT_META[card.intent].color, key: Math.floor(performance.now()) });
      window.setTimeout(() => {
        setDeck((d) => (kind === 'snooze' ? [...d.slice(1), d[0]] : d.slice(1)));
        setFlying(null);
        busy.current = false;
      }, 280);
    },
    [deck]
  );

  const jump = useCallback((id: string) => {
    setDeck((d) => {
      const card = d.find((e) => e.id === id);
      if (!card) return d;
      return [card, ...d.filter((e) => e.id !== id)];
    });
  }, []);

  useEffect(() => {
    if (!burst) return;
    const t = window.setTimeout(() => setBurst(null), 850);
    return () => window.clearTimeout(t);
  }, [burst]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'e') act('archive');
      if (e.key === 'ArrowRight' || e.key === 'r') act('reply');
      if (e.key === 'ArrowDown' || e.key === 's') act('snooze');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [act]);

  const meta = top ? INTENT_META[top.intent] : INTENT_META.noise;
  const done = total - deck.length + (top ? 1 : 0);

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          minHeight: '100vh',
          background: top
            ? `radial-gradient(680px 520px at 50% 30%, ${meta.color}${alphaHex(0.12 + top.urgency * 0.22)}, ${palette.background.base} 66%)`
            : palette.background.base,
          color: palette.text.primary,
          fontFamily: '"Space Grotesk", sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 18px 90px',
          transition: 'background 0.5s ease',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: palette.primary.main,
            }}
          >
            TRIAGE DECK
          </span>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              color: palette.text.muted,
            }}
          >
            {top ? `${done} / ${total}` : 'CLEAR'}
          </span>
        </div>

        {/* Deck */}
        <div
          style={{
            position: 'relative',
            width: 'min(540px, 94vw)',
            height: 'min(60vh, 460px)',
            marginTop: 18,
          }}
        >
          {deck.length === 0 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
              }}
            >
              <div>
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.6, repeat: Infinity }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    background: `radial-gradient(circle, ${palette.primary.main}, transparent 70%)`,
                  }}
                />
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '0.2em',
                    color: palette.text.secondary,
                    fontSize: '0.8rem',
                  }}
                >
                  INBOX CLEAR
                </div>
              </div>
            </div>
          ) : (
            deck.slice(0, 3).map((email, p) => {
              const m = INTENT_META[email.intent];
              const isTop = p === 0;
              const isFlying = flying?.id === email.id;
              const flyTarget = isFlying
                ? flying!.dir === 'left'
                  ? { x: -560, rotate: -14, opacity: 0 }
                  : flying!.dir === 'right'
                    ? { x: 560, rotate: 14, opacity: 0 }
                    : { y: 680, opacity: 0 }
                : {
                    x: 0,
                    y: p * 16,
                    rotate: 0,
                    scale: 1 - p * 0.05,
                    opacity: p > 2 ? 0 : 1 - p * 0.16,
                  };
              return (
                <motion.div
                  key={email.id}
                  initial={false}
                  animate={flyTarget}
                  transition={SPRING}
                  drag={isTop && !flying ? true : false}
                  dragSnapToOrigin
                  dragElastic={0.7}
                  onDragEnd={(_e, info) => {
                    if (info.offset.x < -110) act('archive');
                    else if (info.offset.x > 110) act('reply');
                    else if (info.offset.y > 110) act('snooze');
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10 - p,
                    cursor: isTop ? 'grab' : 'default',
                    borderRadius: 20,
                    border: `1px solid ${m.color}66`,
                    background: `linear-gradient(168deg, ${m.color}1f, rgba(16,14,12,0.96))`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: glow(m.color, email.urgency, 30, 70),
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  whileDrag={{ cursor: 'grabbing' }}
                >
                  <div
                    style={{
                      height: 4,
                      background: `linear-gradient(90deg, transparent, ${m.color}, transparent)`,
                      opacity: 0.5 + email.urgency * 0.5,
                    }}
                  />
                  <div
                    style={{
                      padding: 26,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          color: '#0d0b09',
                          background: m.color,
                          boxShadow: `0 0 ${10 + email.urgency * 24}px ${m.color}`,
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
                    <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem', fontWeight: 600 }}>
                      {email.subject}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        color: palette.text.secondary,
                        lineHeight: 1.6,
                        fontSize: '0.93rem',
                        flex: 1,
                        overflow: 'hidden',
                      }}
                    >
                      {email.body}
                    </p>
                    {isTop && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 16,
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.58rem',
                          letterSpacing: '0.12em',
                          color: palette.text.muted,
                        }}
                      >
                        <span>← archive</span>
                        <span>↓ snooze</span>
                        <span>reply →</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        {top && (
          <div style={{ display: 'flex', gap: 10, marginTop: 28, width: 'min(540px, 94vw)' }}>
            <DeckButton
              label="Archive"
              hint="←"
              color={palette.primary.main}
              onClick={() => act('archive')}
            />
            <DeckButton
              label="Snooze"
              hint="↓"
              color={palette.text.secondary}
              onClick={() => act('snooze')}
            />
            <DeckButton label="Reply" hint="→" color={meta.color} onClick={() => act('reply')} />
          </div>
        )}

        {/* Filmstrip — jump to any card */}
        <div
          style={{
            position: 'fixed',
            bottom: 14,
            left: 0,
            right: 0,
            display: 'flex',
            gap: 7,
            justifyContent: 'center',
            overflowX: 'auto',
            padding: '0 16px',
          }}
        >
          {deck.map((email, p) => {
            const m = INTENT_META[email.intent];
            return (
              <button
                key={email.id}
                onClick={() => jump(email.id)}
                style={{
                  flex: '0 0 auto',
                  width: 44,
                  height: 44,
                  borderRadius: 9,
                  cursor: 'pointer',
                  border: p === 0 ? `2px solid ${m.color}` : `1px solid ${m.color}44`,
                  background: p === 0 ? `${m.color}33` : `${m.color}14`,
                  color: m.color,
                  fontSize: '0.64rem',
                  fontWeight: 700,
                }}
              >
                {initials(email.sender)}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {burst && <EmberBurst key={burst.key} color={burst.color} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function DeckButton({
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
      whileTap={{ scale: 0.96 }}
      style={{
        flex: 1,
        padding: '12px',
        cursor: 'pointer',
        borderRadius: 10,
        border: `1px solid ${color}55`,
        background: 'transparent',
        color,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.7rem',
        letterSpacing: '0.08em',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.6 }}>{hint}</span>
    </motion.button>
  );
}

function EmberBurst({ color }: { color: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      <div style={{ position: 'relative' }}>
        {particles.map((i) => {
          const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
          const dist = 70 + Math.random() * 180;
          const size = 3 + Math.random() * 7;
          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist - 60,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.7 + Math.random() * 0.35, ease: [0.33, 1, 0.68, 1] }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle, #fff 0%, ${color} 60%, transparent 100%)`,
                boxShadow: `0 0 ${size * 3}px ${color}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
