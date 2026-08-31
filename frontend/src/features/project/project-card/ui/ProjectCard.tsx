import clsx from 'clsx';

import CompletedIcon from 'assets/check-icon.svg?react';
import EditIcon from 'assets/edit-icon.svg?react';
import { Project } from 'entities/project';
import { useMe } from 'entities/user';
import { formatDateNumber } from 'shared/lib/formatDate';
import { ArchiveIconBtn, Button, DeleteIconBtn, Tooltip, UserAvatar } from 'shared/ui';

import { ProjectStatusBadge } from '../../project-status-badge/ui/ProjectStatusBadge';
import { useProjectCard } from '../model/useProjectCard';

import styles from './ProjectCard.module.scss';

type TProps = {
  project: Project;
  onEdit: (project: Project) => void;
};

export const ProjectCard = ({ project, onEdit }: TProps) => {
  const { data: user } = useMe();

  const { isArchived, isAnyPending, handleOpen, handleArchive, handleDelete } =
    useProjectCard(project);

  return (
    <div className={styles.card}>
      <div className={styles.card__content}>
        <div className={styles.card__header}>
          <div className={styles['card__header-wrapper']}>
            <h2 className={styles.card__title}>{project.title}</h2>
            <ProjectStatusBadge status={project.status} />
          </div>
          <span className={styles.card__id}>ID: {project.id}</span>
        </div>

        <div className={styles.card__tasks}>
          <span
            className={clsx(
              styles['card__total-tasks'],
              project.total_tasks === 0 && styles['card__total-tasks_empty'],
            )}
          >
            Всего задач: {project.total_tasks}
          </span>
          <span
            className={clsx(
              styles['card__completed-tasks'],
              project.total_tasks === 0 && styles['card__completed-tasks_empty'],
            )}
          >
            Завершенные задачи: {project.completed_tasks}
            <CompletedIcon
              className={clsx(
                styles['card__completed-tasks-icon'],
                project.total_tasks === 0 && styles['card__completed-tasks-icon_empty'],
              )}
            />
          </span>
        </div>

        <div className={styles.card__footer}>
          <span className={styles['card__date-created']}>
            Дата создания {formatDateNumber(project.created_at)}
          </span>

          <UserAvatar src={user?.avatar_path} size={32} />
        </div>
      </div>

      <div className={styles.card__actions}>
        <Button className={styles['card__btn-open']} kind="secondary" onClick={handleOpen}>
          Открыть проект
        </Button>

        <div className={styles['card__actions-wrapper']}>
          <Tooltip withArrow={false} content="Редактировать" disabled={isArchived || isAnyPending}>
            <button
              className={styles['card__actions-btn']}
              onClick={() => onEdit(project)}
              disabled={isArchived || isAnyPending}
            >
              <EditIcon />
            </button>
          </Tooltip>

          {isArchived && <DeleteIconBtn onClick={handleDelete} disabled={isAnyPending} />}

          <ArchiveIconBtn onClick={handleArchive} isArchived={isArchived} disabled={isAnyPending} />
        </div>
      </div>
    </div>
  );
};
