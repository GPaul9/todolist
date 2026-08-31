import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import StatusIcon from 'assets/status-icon.svg?react';
import { Project } from 'entities/project';
import { formatDateNumber } from 'shared/lib';
import { Button, DescriptionEdit, TitleEdit } from 'shared/ui';

import { ProjectStatusBadge } from '../../project-status-badge/ui/ProjectStatusBadge';
import { useProjectModalEdit } from '../model/useProjectModalEdit';

import styles from './ProjectModalEdit.module.scss';

type TProps = {
  project: Project;
  onClose: () => void;
};

export const ProjectModalContent = ({ project, onClose }: TProps) => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const { draft, isPending, handleSetDraft, handleSave, handleCancel } = useProjectModalEdit({
    project,
    onClose,
  });

  return (
    <>
      <div className={styles.modal__content}>
        <div className={styles.modal__info}>
          <TitleEdit
            className={styles.modal__title}
            value={draft.title}
            onSave={(value) => handleSetDraft('title', value)}
          />
          <div className={styles['modal__date-create']}>
            <span className={styles['modal__date-create-label']}>Дата создания: </span>
            {formatDateNumber(draft.created_at)}
          </div>
        </div>

        <div className={styles['modal__status']}>
          {!isTablet && (
            <span className={styles['modal__status-label']}>
              <StatusIcon className={styles['modal__status-icon']} />
              Статус
            </span>
          )}

          <ProjectStatusBadge status={draft.status} />

          {isTablet && <div className={styles.modal__id}>ID: {draft.id}</div>}
        </div>

        <DescriptionEdit
          value={draft.description ?? ''}
          onSave={(value) => handleSetDraft('description', value)}
          maxLength={1000}
        />
      </div>

      <div className={styles.modal__actions}>
        <Button
          className={styles.modal__btn}
          kind="secondary"
          onClick={handleCancel}
          disabled={isPending.update}
        >
          Отмена
        </Button>
        <Button
          className={clsx(styles.modal__btn, styles.modal__btn_save)}
          onClick={handleSave}
          disabled={isPending.update}
          isLoading={isPending.update}
        >
          {isTablet ? 'Сохранить изменения' : 'Сохранить'}
        </Button>
      </div>
    </>
  );
};
