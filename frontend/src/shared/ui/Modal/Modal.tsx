import clsx from 'clsx';
import { FC, ReactNode, useEffect } from 'react';

import { Overlay } from '../Overlay/Overlay';

import styles from './Modal.module.scss';
import { AnimatePresence, motion, Variants } from 'framer-motion';

type TProps = {
  modeX?: 'left' | 'center' | 'right';
  modeY?: 'top' | 'center' | 'bottom';
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  variants?: Variants;
  children: ReactNode;
};

export const Modal: FC<TProps> = ({
  modeX = 'center',
  modeY = 'center',
  isOpen,
  onClose,
  className,
  variants,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, isOpen]);

  useEffect(() => {
  if (!isOpen) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          onClick={onClose}
          className={clsx(
            styles[`modal_modeX-${modeX}`],
            styles[`modal_modeY-${modeY}`]
          )}
        >
          <motion.div
            className={clsx(styles.modal__content, className)}
            onClick={(e) => e.stopPropagation()}
            variants={variants ?? undefined}
            initial={variants ? 'initial' : undefined}
            animate={variants ? 'animate' : undefined}
            exit={variants ? 'exit' : undefined}
          >
            {children}
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
