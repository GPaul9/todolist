import { Variants } from "motion";

export const vacuumGameBtn: Variants = {
  initial: { scale: 0.6, y: -5, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { scale: 0.6, y: 0, x: 10, opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const vacuumGame: Variants = {
  initial: { opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};
