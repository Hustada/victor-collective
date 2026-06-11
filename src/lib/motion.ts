/**
 * Obsidian Ember motion vocabulary.
 *
 * One set of timings and gestures so the whole site moves the same way.
 * Use these with framer-motion instead of inlining ad-hoc transitions:
 *
 *   <motion.div {...fadeUp}>            // content arriving
 *   <motion.span {...popIn}>            // something earned appearing (a draft bolt)
 *   <motion.span animate={emberPulse.animate} transition={emberPulse.transition}>
 *                                       // "the machine is working" indicator
 *   <motion.div {...slideUp}>           // panels and drawers
 *   <motion.div {...consoleLine}>       // log/feed lines arriving
 */

/** House spring — snappy but settled. The default for layout movement. */
export const SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 };

/** Content arriving in place: short rise + fade. */
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: SPRING,
};

/** Something earned appearing — scales in from nothing. */
export const popIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: SPRING,
};

/** Slow ember breathing — the working/alive indicator. Loops forever. */
export const emberPulse = {
  animate: { opacity: [0.35, 1, 0.35] },
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
};

/** Drawers and panels entering from the bottom edge. */
export const slideUp = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 24, opacity: 0 },
  transition: SPRING,
};

/** A log/feed line arriving: slight slide from the left. */
export const consoleLine = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.18 },
};
