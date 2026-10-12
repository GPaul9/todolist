import { clsx } from 'clsx';
import { forwardRef } from 'react';

import ArrowIcon from 'assets/arrow-right-icon.svg?react';

import { STATUS_MAP } from '../../lib/consts';
import { Status } from '../../model/types/tasks';

import styles from './StatusBadge.module.scss';

type TProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  status: Status;
  isActive?: boolean;
  isOpen?: boolean;
  showArrow?: boolean;
  onClick?: () => void;
};

export const StatusBadge = forwardRef<HTMLButtonElement, TProps>(
  ({ status, isActive, isOpen, showArrow, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx(styles.badge, styles[`badge_${status}`], isActive && styles.active)}
        onClick={onClick}
        {...props}
      >
        <span>{STATUS_MAP[status].label}</span>

        {showArrow && (
          <ArrowIcon className={clsx(styles.badge__arrow, isOpen && styles.badge__arrow_up)} />
        )}
      </button>
    );
  },
);

StatusBadge.displayName = 'StatusBadge';
