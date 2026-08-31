import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

import FilterIcon from 'assets/filter-icon.svg?react';
import { dropdown, useDropdown } from 'shared/lib';
import { Overlay } from 'shared/ui';

import styles from './ListControlsMobile.module.scss';

type TProps = {
  children: (handleClose: () => void) => React.ReactNode;
};

export const ListControlsMobile = ({ children }: TProps) => {
  const { isOpen, setIsOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } =
    useDropdown({ offsetValue: 13, zIndex: 149 });

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        className={styles.controls__btn}
        ref={refs.setReference}
        onClick={() => setIsOpen((prev) => !prev)}
        {...getReferenceProps()}
      >
        <FilterIcon className={styles['controls__filter-icon']} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay zIndex={140} />

            {createPortal(
              <div
                className={clsx(styles.controls__dropdown, styles.dropdown)}
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
              >
                <motion.div
                  className={styles.dropdown__motion}
                  variants={dropdown}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className={styles.dropdown__content}>{children(handleClose)}</div>
                </motion.div>
              </div>,
              modalRoot,
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
};
