import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import CreateIcon from 'assets/create-icon.svg?react';
import { Button } from 'shared/ui';

import { useCreateProjectBtn } from '../model/useCreateProjectBtn';

import styles from './CreateProjectBtn.module.scss';

export const CreateProjectBtn = () => {
  const { handleCreate, isPending } = useCreateProjectBtn();

  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  return (
    <>
      {isMobile ? (
        <button className={styles['button-sm']} disabled={isPending} onClick={handleCreate}>
          <CreateIcon />
        </button>
      ) : (
        <Button
          kind="primary"
          className={styles.button}
          isLoading={isPending}
          onClick={handleCreate}
        >
          Создать проект
        </Button>
      )}
    </>
  );
};
