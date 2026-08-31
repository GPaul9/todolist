import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import FilterIcon from 'assets/filter-icon.svg?react';
import { popover, useDropdown } from 'shared/lib';
import { SearchInput } from 'shared/ui';

import styles from './ListControls.module.scss';

type TProps = {
  children: (handleClose: () => void) => React.ReactNode;
};

export const ListControls = ({ children }: TProps) => {
  const {
    isOpen,
    setIsOpen,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    setArrowRef,
  } = useDropdown({ offsetValue: 16 });

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
      <SearchInput paramKey="search" />

      <AnimatePresence>
        {isOpen && (
          <div
            className={clsx(styles.controls__dropdown, styles.dropdown)}
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
              <div ref={setArrowRef} className={styles.dropdown__arrow} />
              <div className={styles.dropdown__content}>{children(handleClose)}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
