import { useCreateTaskModel } from '../model/useCreateTaskBtn';

import styles from './CreateTaskBtnAbsolute.module.scss';

type TProps = {
  listId: number;
  disabled?: boolean;
};

export const CreateTaskBtnAbsolute = ({ listId, disabled }: TProps) => {
  const { handleClick, isPending } = useCreateTaskModel(listId);

  return (
    <button className={styles.button} onClick={handleClick} disabled={isPending || disabled} />
  );
};
