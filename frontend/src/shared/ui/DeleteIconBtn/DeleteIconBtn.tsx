import DeleteIcon from 'assets/delete-icon.svg?react';

import { Tooltip } from '../Tooltip/Tooltip';

import styles from './DeleteIconBtn.module.scss';

type TProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const DeleteIconBtn = ({ onClick, disabled }: TProps) => {
  return (
    <Tooltip content="Удалить" disabled={disabled} withArrow={false} zIndex={200}>
      <button className={styles.btn} onClick={onClick} disabled={disabled}>
        <DeleteIcon />
      </button>
    </Tooltip>
  );
};
