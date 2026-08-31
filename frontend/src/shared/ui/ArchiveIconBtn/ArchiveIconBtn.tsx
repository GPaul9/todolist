import ArchiveIcon from 'assets/archive-icon.svg?react';
import UnArchiveIcon from 'assets/unarchive-icon.svg?react';

import { Tooltip } from '../Tooltip/Tooltip';

import styles from './ArchiveIconBtn.module.scss';

type TProps = {
  onClick: () => void;
  isArchived: boolean;
  disabled?: boolean;
};

export const ArchiveIconBtn = ({ onClick, disabled, isArchived }: TProps) => {
  return (
    <Tooltip
      content={isArchived ? 'Восстановить' : 'В архив'}
      disabled={disabled}
      withArrow={false}
      zIndex={200}
    >
      <button className={styles.btn} onClick={onClick} disabled={disabled}>
        {isArchived ? <UnArchiveIcon /> : <ArchiveIcon />}
      </button>
    </Tooltip>
  );
};
