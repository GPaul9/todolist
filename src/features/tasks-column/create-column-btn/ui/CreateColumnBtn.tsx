import { Button } from 'shared/ui';

import { useCreateColumnBtn } from '../model/useCreateColumnBtn';

import styles from './CreateColumnBtn.module.scss';

type TProps = {
  projectId: number;
};

export const CreateColumnBtn = ({ projectId }: TProps) => {
  const { handleClick, isPending } = useCreateColumnBtn(projectId);

  return (
    <Button isLoading={isPending} kind="primary" className={styles.button} onClick={handleClick}>
      Создать список
    </Button>
  );
};
