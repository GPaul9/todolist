import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { popover, useDropdown } from 'shared/lib';

import { STATUS_MAP } from '../../lib/consts';
import { Status } from '../../model/types/tasks';
import { StatusBadge } from '../StatusBadge/StatusBadge';

import styles from './StatusList.module.scss';

interface TProps {
  currentStatus: Status;
  onChange: (status: Status) => void;
  disabled?: boolean;
  className?: string;
}

export const StatusList = ({ currentStatus, onChange, disabled = false, className }: TProps) => {
  const { isOpen, setIsOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } =
    useDropdown({ offsetValue: 4 });

  const statuses = Object.keys(STATUS_MAP) as Status[];
  const orderedStatuses = statuses.filter((status) => status !== currentStatus);

  const handleSelect = (s: Status) => {
    if (disabled) return;
    if (s !== currentStatus) onChange(s);
    setIsOpen(false);
  };

  return (
    <div
      className={clsx(styles.list, disabled && styles.disabled, className)}
      aria-disabled={disabled}
    >
      <StatusBadge
        status={currentStatus}
        showArrow
        ref={refs.setReference}
        onClick={() => setIsOpen((prev) => !prev)}
        isOpen={isOpen}
        disabled={disabled}
        {...getReferenceProps()}
      />

      <AnimatePresence>
        {!disabled && isOpen && (
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <motion.div
              className={styles.list__dropdown}
              variants={popover}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {orderedStatuses.map((status) => (
                <StatusBadge
                  key={status}
                  status={status}
                  isActive={status === currentStatus}
                  onClick={() => handleSelect(status)}
                  disabled={disabled}
                />
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
