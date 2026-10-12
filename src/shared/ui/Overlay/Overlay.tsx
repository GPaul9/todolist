import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { overlay } from 'shared/lib';

import styles from './Overlay.module.scss';

type TProps = {
  onClick?: () => void;
  zIndex?: number;
  className?: string;
  children?: ReactNode;
};

export const Overlay: FC<TProps> = ({ onClick, zIndex = 200, className, children }) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <motion.div
      variants={overlay}
      initial="initial"
      animate="animate"
      exit="exit"
      className={clsx(styles.overlay, className)}
      onClick={onClick}
      style={{ zIndex }}
    >
      {children}
    </motion.div>,
    modalRoot,
  );
};
