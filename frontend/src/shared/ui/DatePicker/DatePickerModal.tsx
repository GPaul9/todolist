import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

import { dropdown } from 'shared/lib';

import { Modal } from '../Modal/Modal';

import styles from './DatePickerModal.module.scss';

type TProps = {
  trigger: ReactNode;
  children: ReactNode | ((handleClose: () => void) => ReactNode);
  className?: string;
};

export const DatePickerModal = ({ trigger, children, className }: TProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={styles.picker__btn}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div className={clsx(styles.picker__dropdown, styles.dropdown)}>
              <motion.div
                className={styles.dropdown__motion}
                variants={dropdown}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={clsx(styles.dropdown__content, className)}>
                  {typeof children === 'function' ? children(handleClose) : children}
                </div>
              </motion.div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};
