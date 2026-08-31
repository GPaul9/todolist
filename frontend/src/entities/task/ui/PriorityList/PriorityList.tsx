import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { PRIORITY_MAP } from 'entities/task/lib/consts';
import { popover, useDropdown } from 'shared/lib';

import { Priority } from '../../model/types/tasks';
import { PriorityBadge } from '../PriorityBadge/PriorityBadge';

import styles from './PriorityList.module.scss';

interface TProps {
  currentPriority: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
  className?: string;
}

export const PriorityList = ({
  currentPriority,
  onChange,
  disabled = false,
  className,
}: TProps) => {
  const { isOpen, setIsOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } =
    useDropdown({ offsetValue: 4 });

  const priorities = Object.keys(PRIORITY_MAP) as Priority[];
  const orderedPriorities = priorities.filter((priority) => priority !== currentPriority);

  const handleSelect = (p: Priority) => {
    if (disabled) return;
    if (p !== currentPriority) onChange(p);
    setIsOpen(false);
  };

  return (
    <div className={clsx(styles.list, disabled && styles.disabled, className)}>
      <PriorityBadge
        priority={currentPriority}
        ref={refs.setReference}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        {...getReferenceProps()}
      />

      <AnimatePresence>
        {isOpen && (
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <motion.div
              className={styles.list__dropdown}
              variants={popover}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {orderedPriorities.map((priority) => (
                <PriorityBadge
                  key={priority}
                  priority={priority}
                  isActive={priority === currentPriority}
                  onClick={() => handleSelect(priority)}
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
