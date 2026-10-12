import clsx from 'clsx';
import { forwardRef } from 'react';

import { PRIORITY_MAP } from '../../lib/consts';
import { Priority } from '../../model/types/tasks';

import styles from './PriorityBadge.module.scss';

type TProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  priority: Priority;
  isActive?: boolean;
  onClick?: () => void;
};

export const PriorityBadge = forwardRef<HTMLButtonElement, TProps>(
  ({ priority, isActive, onClick, ...props }, ref) => {
    const Icon = PRIORITY_MAP[priority].icon;

    return (
      <button
        ref={ref}
        type="button"
        className={clsx(
          styles.badge,
          styles[`badge_${priority}`],
          isActive && styles[`badge_${priority}-active`],
        )}
        onClick={onClick}
        {...props}
      >
        <Icon className={styles.badge__icon} />
        {PRIORITY_MAP[priority].label}
      </button>
    );
  },
);

PriorityBadge.displayName = 'PriorityBadge';
