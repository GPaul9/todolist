import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useDropdown, popover } from 'shared/lib';

import styles from './DatePickerPopover.module.scss';

type TProps = {
  trigger: ReactNode;
  children: ReactNode | ((handleClose: () => void) => ReactNode);
  className?: string;
  placement?: 'left-start' | 'bottom-end';
};

export const DatePickerPopover = ({
  trigger,
  children,
  className,
  placement = 'left-start',
}: TProps) => {
  const { isOpen, setIsOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } =
    useDropdown({ placement, offsetValue: 24 });

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={styles.picker__btn}
        ref={refs.setReference}
        onClick={() => setIsOpen((prev) => !prev)}
        {...getReferenceProps()}
        type="button"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {createPortal(
              <div
                className={clsx(styles.picker__dropdown, styles.dropdown)}
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
              >
                <motion.div
                  className={styles.dropdown__motion}
                  variants={popover}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className={clsx(styles.dropdown__content, className)}>
                    {typeof children === 'function' ? children(handleClose) : children}
                  </div>
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
