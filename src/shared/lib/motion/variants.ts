import { Variants } from 'motion';

export const tooltip: Variants = {
  initial: { y: -5, opacity: 0, scale: 0.9 },
  animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { y: -5, opacity: 0, scale: 0.9 },
};

export const dropdown: Variants = {
  initial: { y: -80 },
  animate: { y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { y: -140, opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const popover: Variants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const overlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const modal: Variants = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
}
export const modalMobile: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
}

export const accordion: Variants = {
  initial: { opacity: 0, height: 0, overflow: 'hidden' },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
