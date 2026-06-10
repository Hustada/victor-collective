'use client';

/**
 * THROWAWAY PROTOTYPE — Altitude inbox zoom feel (polish pass).
 * Dummy data, no backend. Goal: judge whether the ORBIT<->FOCUS dive/lift
 * motion + heat aesthetic is good enough to build for real.
 *
 * Controls: click a tile to dive · Esc / click backdrop to rise ·
 * ←/→ (or j/k) riffle in focus · scroll to zoom · e archive · s snooze
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from 'framer-motion';
import { palette } from '@/theme';

type Intent = 'reply' | 'money' | 'waiting' | 'noise';

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  intent: Intent;
  age: string;
  urgency: number; // 0..1 — drives glow intensity
}

const INTENT_ORDER: Intent[] = ['reply', 'money', 'waiting', 'noise'];

const INTENT_META: Record<Intent, { label: string; color: string; glow: string }> = {
  reply: { label: 'NEEDS REPLY', color: '#FF7A3D', glow: 'rgba(255,122,61,1)' },
  money: { label: 'MONEY', color: '#FF4D4D', glow: 'rgba(255,77,77,1)' },
  waiting: { label: 'WAITING ON THEM', color: '#7C9CB8', glow: 'rgba(124,156,184,1)' },
  noise: { label: 'NOISE', color: '#6B6B6B', glow: 'rgba(120,120,120,1)' },
};

const SPRING = { type: 'spring' as const, stiffness: 220, damping: 28 };

// glow shadow scaled by urgency (0..1)
function glowShadow(intent: Intent, urgency: number, base: number, max: number): string {
  const meta = INTENT_META[intent];
  const blur = base + urgency * max;
  const alpha = 0.15 + urgency * 0.6;
  const c = meta.glow.replace('1)', `${alpha})`);
  return `0 8px 26px rgba(0,0,0,0.45), 0 0 ${blur}px ${c}`;
}

const alphaHex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0');

const EMAILS: Email[] = [
  {
    id: 'e1',
    sender: 'Chris Johnson',
    subject: 'Re: Strategic Edge Platform',
    preview: 'Can we get together this week? I’ll need some training.',
    body: 'Hey Mark — can we get together this week? I’ll definitely need some training. When I clicked on several leads, the system pulled them up but I wasn’t sure what to do next. THANK YOU+++',
    intent: 'reply',
    age: '2h',
    urgency: 0.9,
  },
  {
    id: 'e2',
    sender: 'Marc Huff',
    subject: 'Re: DNS',
    preview: 'It’d be faster if you let me know what SPF record you need.',
    body: 'It’d be considerably faster if you let me know what SPF record you need added. It’s not that I can’t — I just need the exact value.',
    intent: 'reply',
    age: '5h',
    urgency: 0.7,
  },
  {
    id: 'e3',
    sender: 'Dana Whitfield',
    subject: 'Proposal follow-up',
    preview: 'Loved the deck. What’s the next step?',
    body: 'Loved the deck you sent over. What’s the next step to get started? Happy to hop on a call.',
    intent: 'reply',
    age: '1d',
    urgency: 0.55,
  },
  {
    id: 'e4',
    sender: 'Billing · Stripe',
    subject: 'Invoice TVC-001 is unpaid',
    preview: 'TVC-001 ($3,800) has been outstanding for 6 days.',
    body: 'Invoice TVC-001 for $3,800 has been outstanding for 6 days. Consider sending a reminder.',
    intent: 'money',
    age: '6d',
    urgency: 0.95,
  },
  {
    id: 'e5',
    sender: 'Stripe',
    subject: 'Payout sent',
    preview: 'A payout of $4,120.00 is on its way.',
    body: 'A payout of $4,120.00 is on its way to your bank account ending 4429.',
    intent: 'money',
    age: '1d',
    urgency: 0.35,
  },
  {
    id: 'e6',
    sender: 'Acme Vendor',
    subject: 'Re: contract redlines',
    preview: 'Our legal is reviewing — back to you Friday.',
    body: 'Thanks for the redlines. Our legal team is reviewing and we’ll be back to you by Friday.',
    intent: 'waiting',
    age: '3d',
    urgency: 0.3,
  },
  {
    id: 'e7',
    sender: 'Priya Nair',
    subject: 'Re: scheduling',
    preview: 'Checking with my team on times — will confirm.',
    body: 'Checking with my team on the times you proposed. Will confirm soon.',
    intent: 'waiting',
    age: '2d',
    urgency: 0.3,
  },
  {
    id: 'e8',
    sender: 'PairVia',
    subject: 'You’re invited to join PairVia',
    preview: 'Start collaborating with your team today.',
    body: 'Start collaborating with your team today on PairVia.',
    intent: 'noise',
    age: '12h',
    urgency: 0.08,
  },
  {
    id: 'e9',
    sender: 'LinkedIn',
    subject: 'You appeared in 9 searches',
    preview: 'See who’s been looking at your profile.',
    body: 'You appeared in 9 searches this week.',
    intent: 'noise',
    age: '1d',
    urgency: 0.08,
  },
  {
    id: 'e10',
    sender: 'Substack',
    subject: 'The week in AI',
    preview: 'Five things that happened while you built.',
    body: 'Five things that happened while you were building.',
    intent: 'noise',
    age: '2d',
    urgency: 0.08,
  },
  {
    id: 'e11',
    sender: 'Product Hunt',
    subject: 'Today’s top launches',
    preview: 'The 10 products everyone’s talking about.',
    body: 'The 10 products everyone’s talking about today.',
    intent: 'noise',
    age: '3d',
    urgency: 0.08,
  },
  {
    id: 'e12',
    sender: 'Notion',
    subject: 'New in your workspace',
    preview: 'Tips to get more out of Notion.',
    body: 'Tips to get more out of your Notion workspace.',
    intent: 'noise',
    age: '4d',
    urgency: 0.08,
  },
];

function initials(name: string): string {
  const parts = name
    .replace(/[·•].*$/, '')
    .trim()
    .split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '@';
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

export default function AltitudePrototype() {
  const [emails, setEmails] = useState<Email[]>(EMAILS);
  const [altitude, setAltitude] = useState<'orbit' | 'focus'>('orbit');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [wheelLock, setWheelLock] = useState(false);
  const [burst, setBurst] = useState<{ color: string; key: number } | null>(null);
  const isMobile = useIsMobile();

  const ordered = INTENT_ORDER.flatMap((i) => emails.filter((e) => e.intent === i));
  const focused = emails.find((e) => e.id === focusedId) || null;

  const dive = useCallback((id: string) => {
    setFocusedId(id);
    setAltitude('focus');
  }, []);
  const rise = useCallback(() => setAltitude('orbit'), []);

  const move = useCallback(
    (dir: 1 | -1) => {
      if (!focusedId) return;
      const idx = ordered.findIndex((e) => e.id === focusedId);
      const next = ordered[(idx + dir + ordered.length) % ordered.length];
      if (next) setFocusedId(next.id);
    },
    [focusedId, ordered]
  );

  const archive = useCallback(() => {
    if (!focused) return;
    setBurst({ color: INTENT_META[focused.intent].color, key: Math.floor(performance.now()) });
    const idx = ordered.findIndex((e) => e.id === focused.id);
    const nextId = ordered[idx + 1]?.id || ordered[idx - 1]?.id || null;
    setEmails((prev) => prev.filter((e) => e.id !== focused.id));
    if (nextId) setFocusedId(nextId);
    else {
      setAltitude('orbit');
      setFocusedId(null);
    }
  }, [focused, ordered]);

  useEffect(() => {
    if (!burst) return;
    const t = window.setTimeout(() => setBurst(null), 850);
    return () => window.clearTimeout(t);
  }, [burst]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') rise();
      if (altitude === 'focus') {
        if (e.key === 'ArrowRight' || e.key === 'j') move(1);
        if (e.key === 'ArrowLeft' || e.key === 'k') move(-1);
        if (e.key === 'e' || e.key === 's') archive();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [altitude, move, rise, archive]);

  const onWheel = (e: React.WheelEvent) => {
    if (wheelLock) return;
    if (e.deltaY < -8 && altitude === 'orbit') dive(ordered[0]?.id || 'e1');
    else if (e.deltaY > 8 && altitude === 'focus') rise();
    else return;
    setWheelLock(true);
    window.setTimeout(() => setWheelLock(false), 450);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        onWheel={onWheel}
        style={{
          minHeight: '100vh',
          background: `radial-gradient(1200px 800px at 50% -10%, #181310 0%, ${palette.background.base} 55%)`,
          color: palette.text.primary,
          fontFamily: '"Space Grotesk", sans-serif',
          padding: '28px 24px 76px',
          overflowX: 'hidden',
        }}
      >
        <Header altitude={altitude} count={emails.length} />

        <LayoutGroup>
          {altitude === 'focus' && focused ? (
            isMobile ? (
              <MobileFocus
                focused={focused}
                ordered={ordered}
                onPick={dive}
                onRise={rise}
                onArchive={archive}
              />
            ) : (
              <FocusView
                focused={focused}
                ordered={ordered}
                onPick={dive}
                onRise={rise}
                onArchive={archive}
              />
            )
          ) : isMobile ? (
            <MobileOrbit emails={emails} onDive={dive} />
          ) : (
            <OrbitView emails={emails} onDive={dive} />
          )}
        </LayoutGroup>

        <AnimatePresence>
          {burst && <EmberBurst key={burst.key} color={burst.color} />}
        </AnimatePresence>
        {!isMobile && <ControlHint altitude={altitude} />}
      </div>
    </MotionConfig>
  );
}

function Header({ altitude, count }: { altitude: string; count: number }) {
  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto 24px',
        display: 'flex',
        alignItems: 'baseline',
        gap: 16,
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
        ALTITUDE
      </span>
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.25em',
          color: palette.text.muted,
        }}
      >{`// ${altitude.toUpperCase()} · ${count} MESSAGES`}</span>
    </div>
  );
}

const ZONE_CAP = 6;

function OrbitView({ emails, onDive }: { emails: Email[]; onDive: (id: string) => void }) {
  const [expanded, setExpanded] = useState<Set<Intent>>(new Set());
  let gi = 0;
  return (
    <>
      <style>{`
        .altitude-orbit {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-auto-rows: 1fr;
          gap: 16px;
          max-width: 1280px;
          margin: 0 auto;
          min-height: calc(100vh - 150px);
        }
        @media (max-width: 760px) {
          .altitude-orbit { grid-template-columns: 1fr; grid-auto-rows: auto; min-height: 0; }
        }
      `}</style>
      <div className="altitude-orbit">
        {INTENT_ORDER.map((intent) => {
          const group = emails.filter((e) => e.intent === intent);
          const meta = INTENT_META[intent];
          const maxUrg = group.reduce((m, e) => Math.max(m, e.urgency), 0);
          const isExpanded = expanded.has(intent);
          const visible = isExpanded ? group : group.slice(0, ZONE_CAP);
          const hidden = group.length - visible.length;
          return (
            <div
              key={intent}
              style={{
                position: 'relative',
                borderRadius: 16,
                padding: '18px 20px 22px',
                border: `1px solid ${meta.color}1f`,
                background: `radial-gradient(130% 120% at 22% 0%, ${meta.color}${alphaHex(0.05 + maxUrg * 0.13)}, rgba(14,12,11,0.25) 62%)`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.62rem',
                  letterSpacing: '0.2em',
                  color: meta.color,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: meta.color,
                    boxShadow: `0 0 12px ${meta.color}`,
                  }}
                />
                {meta.label} · {group.length}
              </div>
              {group.length === 0 ? (
                <div
                  style={{
                    color: palette.text.muted,
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    opacity: 0.5,
                  }}
                >
                  — clear —
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))',
                    gap: 12,
                  }}
                >
                  {visible.map((email) => {
                    const delay = gi++ * 0.025;
                    return (
                      <motion.button
                        key={email.id}
                        layoutId={email.id}
                        onClick={() => onDive(email.id)}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...SPRING, delay }}
                        whileHover={{
                          y: -5,
                          boxShadow: glowShadow(intent, Math.min(1, email.urgency + 0.3), 18, 36),
                        }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          width: '100%',
                          height: 96,
                          padding: 13,
                          textAlign: 'left',
                          cursor: 'pointer',
                          border: `1px solid ${meta.color}55`,
                          borderRadius: 10,
                          background: `linear-gradient(160deg, ${meta.color}22, rgba(20,18,16,0.65))`,
                          backdropFilter: 'blur(8px)',
                          boxShadow: glowShadow(intent, email.urgency, 10, 26),
                          color: palette.text.primary,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: meta.color }}>
                          {initials(email.sender)}
                        </span>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            lineHeight: 1.25,
                            color: palette.text.secondary,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as const,
                          }}
                        >
                          {email.subject}
                        </span>
                      </motion.button>
                    );
                  })}
                  {hidden > 0 && (
                    <button
                      onClick={() => setExpanded((prev) => new Set(prev).add(intent))}
                      style={{
                        width: '100%',
                        height: 96,
                        cursor: 'pointer',
                        border: `1px dashed ${meta.color}44`,
                        borderRadius: 10,
                        background: 'transparent',
                        color: meta.color,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.72rem',
                        letterSpacing: '0.1em',
                      }}
                    >
                      +{hidden} more
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function FocusView({
  focused,
  ordered,
  onPick,
  onRise,
  onArchive,
}: {
  focused: Email;
  ordered: Email[];
  onPick: (id: string) => void;
  onRise: () => void;
  onArchive: () => void;
}) {
  const meta = INTENT_META[focused.intent];
  return (
    <>
      <motion.div
        onClick={onRise}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(6,5,4,0.7)', zIndex: 1 }}
      />

      {/* Ambient heat field behind the card — fills the space, scales with urgency */}
      <motion.div
        key={focused.intent + focused.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.35, 0.6, 0.45][0] + focused.urgency * 0.4 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: `radial-gradient(600px 600px at 50% 42%, ${meta.color}${Math.round(
            (0.12 + focused.urgency * 0.22) * 255
          )
            .toString(16)
            .padStart(2, '0')}, transparent 70%)`,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 24,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          layoutId={focused.id}
          transition={SPRING}
          style={{
            pointerEvents: 'auto',
            width: 'min(620px, 92vw)',
            borderRadius: 18,
            border: `1px solid ${meta.color}77`,
            background: `linear-gradient(168deg, ${meta.color}1f, rgba(16,14,12,0.94))`,
            backdropFilter: 'blur(20px)',
            boxShadow: glowShadow(focused.intent, focused.urgency, 40, 90),
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
              opacity: 0.5 + focused.urgency * 0.5,
            }}
          />
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  color: '#0d0b09',
                  background: meta.color,
                  boxShadow: `0 0 ${10 + focused.urgency * 26}px ${meta.color}`,
                }}
              >
                {initials(focused.sender)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.02rem' }}>{focused.sender}</div>
                <div
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    color: meta.color,
                  }}
                >
                  {meta.label} · {focused.age}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <h2 style={{ margin: '0 0 12px', fontSize: '1.35rem', fontWeight: 600 }}>
                {focused.subject}
              </h2>
              <p
                style={{
                  margin: 0,
                  color: palette.text.secondary,
                  lineHeight: 1.65,
                  fontSize: '0.95rem',
                }}
              >
                {focused.body}
              </p>

              <div
                style={{
                  marginTop: 22,
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
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ color: palette.primary.main }}
                >
                  ⚡
                </motion.span>
                Draft reply in your voice — arrives with draft-ahead (feature #3)
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <ActionButton
                  label="Archive"
                  hint="E"
                  color={palette.primary.main}
                  onClick={onArchive}
                />
                <ActionButton
                  label="Snooze"
                  hint="S"
                  color={palette.text.secondary}
                  onClick={onArchive}
                />
                <ActionButton label="Reply" hint="R" color={meta.color} onClick={() => {}} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filmstrip dock — the whole queue, always pickable */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            maxWidth: '92vw',
            paddingBottom: 4,
          }}
        >
          {ordered.map((email) => {
            const m = INTENT_META[email.intent];
            if (email.id === focused.id) {
              return (
                <div
                  key={email.id}
                  style={{
                    flex: '0 0 auto',
                    width: 52,
                    height: 52,
                    borderRadius: 9,
                    border: `2px solid ${m.color}`,
                    background: `${m.color}33`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: m.color,
                    boxShadow: `0 0 16px ${m.color}`,
                  }}
                >
                  {initials(email.sender)}
                </div>
              );
            }
            return (
              <motion.button
                key={email.id}
                layoutId={email.id}
                onClick={() => onPick(email.id)}
                transition={SPRING}
                whileHover={{ y: -3 }}
                style={{
                  flex: '0 0 auto',
                  width: 52,
                  height: 52,
                  borderRadius: 9,
                  cursor: 'pointer',
                  border: `1px solid ${m.color}55`,
                  background: `${m.color}18`,
                  color: m.color,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {initials(email.sender)}
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ---- Mobile: stacked priority feed ----
function MobileOrbit({ emails, onDive }: { emails: Email[]; onDive: (id: string) => void }) {
  const [showNoise, setShowNoise] = useState(false);
  let gi = 0;
  return (
    <div
      style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {INTENT_ORDER.map((intent) => {
        const group = emails.filter((e) => e.intent === intent);
        if (group.length === 0) return null;
        const meta = INTENT_META[intent];
        const collapsed = intent === 'noise' && !showNoise;
        return (
          <div key={intent} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: meta.color,
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: meta.color,
                  boxShadow: `0 0 10px ${meta.color}`,
                }}
              />
              {meta.label} · {group.length}
            </div>
            {collapsed ? (
              <button
                onClick={() => setShowNoise(true)}
                style={{
                  textAlign: 'left',
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `1px dashed ${meta.color}44`,
                  background: 'transparent',
                  color: palette.text.muted,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                }}
              >
                +{group.length} noise messages — tap to show
              </button>
            ) : (
              group.map((email) => (
                <MobileCard key={email.id} email={email} delay={gi++ * 0.02} onDive={onDive} />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

function MobileCard({
  email,
  delay,
  onDive,
}: {
  email: Email;
  delay: number;
  onDive: (id: string) => void;
}) {
  const meta = INTENT_META[email.intent];
  return (
    <motion.button
      layoutId={email.id}
      onClick={() => onDive(email.id)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex',
        gap: 13,
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        padding: 14,
        borderRadius: 13,
        cursor: 'pointer',
        color: palette.text.primary,
        border: `1px solid ${meta.color}30`,
        borderLeft: `3px solid ${meta.color}`,
        background: `linear-gradient(120deg, ${meta.color}14, rgba(20,18,16,0.6))`,
        boxShadow: glowShadow(email.intent, email.urgency, 8, 22),
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: '#0d0b09',
          background: meta.color,
          boxShadow: `0 0 ${8 + email.urgency * 18}px ${meta.color}`,
        }}
      >
        {initials(email.sender)}
      </span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.92rem',
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
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.58rem',
              color: palette.text.muted,
            }}
          >
            {email.age}
          </span>
        </span>
        <span
          style={{
            fontSize: '0.84rem',
            color: palette.text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {email.subject}
        </span>
        <span
          style={{
            fontSize: '0.74rem',
            color: palette.text.secondary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {email.preview}
        </span>
      </span>
    </motion.button>
  );
}

// ---- Mobile: full-screen focus ----
function MobileFocus({
  focused,
  ordered,
  onPick,
  onRise,
  onArchive,
}: {
  focused: Email;
  ordered: Email[];
  onPick: (id: string) => void;
  onRise: () => void;
  onArchive: () => void;
}) {
  const meta = INTENT_META[focused.intent];
  return (
    <motion.div
      layoutId={focused.id}
      transition={SPRING}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.1, bottom: 0.6 }}
      dragSnapToOrigin
      onDragEnd={(_e, info) => {
        if (info.offset.y > 130 || info.velocity.y > 600) onRise();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(700px 520px at 50% 16%, ${meta.color}${alphaHex(0.16 + focused.urgency * 0.22)}, ${palette.background.base} 68%)`,
      }}
    >
      <div
        style={{
          height: 4,
          width: 44,
          borderRadius: 2,
          background: palette.text.muted,
          opacity: 0.5,
          margin: '10px auto 0',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px 8px' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: '#0d0b09',
            background: meta.color,
            boxShadow: `0 0 ${10 + focused.urgency * 24}px ${meta.color}`,
          }}
        >
          {initials(focused.sender)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{focused.sender}</div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.16em',
              color: meta.color,
            }}
          >
            {meta.label} · {focused.age}
          </div>
        </div>
        <button
          onClick={onRise}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1px solid ${palette.border.default}`,
            background: 'transparent',
            color: palette.text.secondary,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 18px' }}>
        <h2 style={{ margin: '6px 0 14px', fontSize: '1.4rem', fontWeight: 600 }}>
          {focused.subject}
        </h2>
        <p
          style={{ margin: 0, color: palette.text.secondary, lineHeight: 1.7, fontSize: '0.98rem' }}
        >
          {focused.body}
        </p>
        <div
          style={{
            marginTop: 22,
            padding: 14,
            borderRadius: 10,
            border: `1px dashed ${palette.border.default}`,
            color: palette.text.muted,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ color: palette.primary.main }}>⚡</span> Draft reply in your voice —
          draft-ahead (feature #3)
        </div>
      </div>

      {/* filmstrip + actions pinned to the bottom */}
      <div
        style={{
          padding: '10px 14px calc(14px + env(safe-area-inset-bottom))',
          borderTop: `1px solid ${palette.border.subtle}`,
          background: 'rgba(10,9,8,0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 8 }}>
          {ordered.map((email) => {
            const m = INTENT_META[email.intent];
            const isF = email.id === focused.id;
            return (
              <button
                key={email.id}
                onClick={() => onPick(email.id)}
                style={{
                  flex: '0 0 auto',
                  width: 46,
                  height: 46,
                  borderRadius: 9,
                  cursor: 'pointer',
                  border: isF ? `2px solid ${m.color}` : `1px solid ${m.color}44`,
                  background: isF ? `${m.color}33` : `${m.color}14`,
                  color: m.color,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                }}
              >
                {initials(email.sender)}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionButton label="Archive" hint="E" color={palette.primary.main} onClick={onArchive} />
          <ActionButton
            label="Snooze"
            hint="S"
            color={palette.text.secondary}
            onClick={onArchive}
          />
          <ActionButton label="Reply" hint="R" color={meta.color} onClick={() => {}} />
        </div>
      </div>
    </motion.div>
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
        zIndex: 6,
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
                y: Math.sin(angle) * dist - 90,
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

function ActionButton({
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
        flex: 1,
        padding: '11px 12px',
        cursor: 'pointer',
        borderRadius: 8,
        border: `1px solid ${color}55`,
        background: 'transparent',
        color,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
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

function ControlHint({ altitude }: { altitude: string }) {
  const hint =
    altitude === 'orbit'
      ? 'click a tile to dive · scroll up to zoom in'
      : '←/→ riffle · E archive · S snooze · Esc / scroll down to rise';
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.62rem',
        letterSpacing: '0.12em',
        color: palette.text.muted,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      {hint}
    </div>
  );
}
