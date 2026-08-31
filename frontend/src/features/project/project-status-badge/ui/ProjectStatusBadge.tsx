import clsx from 'clsx';

import { Project } from 'entities/project';

import styles from './ProjectStatusBadge.module.scss';

type TProps = {
  status: Project['status'];
};

export const ProjectStatusBadge = ({ status }: TProps) => {
  return (
    <div
      className={clsx(
        styles.badge,
        status === 'active' ? styles.badge_active : styles.badge_archive,
      )}
    >
      {status === 'active' ? 'Активный' : 'Архивный'}
    </div>
  );
};
