import CreateColumnIcon from 'assets/create-icon-light.svg?react';

import { useCreateColumnBtn } from '../model/useCreateColumnBtn';

import styles from './CreateColumnBtnIcon.module.scss';

type TProps = {
  projectId: number;
  disabled?: boolean;
};

export const CreateColumnBtnIcon = ({ projectId, disabled }: TProps) => {
  const { handleClick, isPending } = useCreateColumnBtn(projectId);

  return (
    <button className={styles.button} onClick={handleClick} disabled={isPending || disabled}>
      <CreateColumnIcon />
    </button>
  );
};
