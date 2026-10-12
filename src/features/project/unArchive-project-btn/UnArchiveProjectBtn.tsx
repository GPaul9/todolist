import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import UnArchiveIcon from 'assets/unarchive-icon.svg?react';
import { useUnArchiveProject } from 'entities/project';
import { useDialog } from 'shared/lib';
import { Button, Tooltip } from 'shared/ui';

import styles from './UnArchiveProjectBtn.module.scss';

type TProps = {
  projectId: number;
};

export const UnArchiveProjectBtn = ({ projectId }: TProps) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  const { mutateAsync, isPending } = useUnArchiveProject();
  const navigate = useNavigate();
  const dialog = useDialog();

  const handleClick = async () => {
    const ok = await dialog.confirm({
      description: 'Восстановить проект?',
    });
    if (ok) await mutateAsync(projectId).then(() => navigate('/archive'));
  };

  return (
    <>
      {isMobile ? (
        <Tooltip content={'Восстановить проект'} withArrow={false}>
          <button className={styles['btn-mobile']} onClick={handleClick}>
            <UnArchiveIcon />
          </button>
        </Tooltip>
      ) : (
        <Button className={styles.btn} onClick={handleClick} disabled={isPending}>
          Вернуть в работу
        </Button>
      )}
    </>
  );
};
