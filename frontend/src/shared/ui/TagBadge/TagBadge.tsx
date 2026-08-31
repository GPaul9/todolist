import clsx from 'clsx';
import { CSSProperties } from 'react';

import CrossIcon from 'assets/cross-icon.svg?react';

import styles from './TagBadge.module.scss';

interface TProps {
  name: string;
  color: string;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export const TagBadge = ({
  name,
  color,
  isActive = false,
  className,
  onClick,
  onRemove,
}: TProps) => {
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemove?.();
  };
  return (
    <div
      className={clsx(
        styles.badge,
        isActive && styles.badge_active,
        onRemove && styles.badge_removable,
        className,
      )}
      onClick={onClick}
      style={{ '--tag-color': color } as CSSProperties}
    >
      <span className={styles.badge__text}>{name || 'Название тега'}</span>

      {onRemove && (
        <button className={styles.badge__delete} onClick={handleRemove} type="button">
          <CrossIcon width={12} height={12} />
        </button>
      )}
    </div>
  );
};
