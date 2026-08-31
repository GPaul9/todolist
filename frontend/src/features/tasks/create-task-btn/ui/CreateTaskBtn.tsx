import CreateIcon from 'assets/create-icon.svg?react';

import { useCreateTaskModel } from '../model/useCreateTaskBtn';

import styles from './CreateTaskBtn.module.scss';

type TProps = {
  listId: number;
  disabled?: boolean;
};

export const CreateTaskBtn = ({ listId, disabled }: TProps) => {
  const { handleClick, isPending } = useCreateTaskModel(listId);

  return (
    <button className={styles.button} onClick={handleClick} disabled={isPending || disabled}>
      Новая задача
      <CreateIcon className={styles['column__btn-create-icon']} />
    </button>
  );
};
