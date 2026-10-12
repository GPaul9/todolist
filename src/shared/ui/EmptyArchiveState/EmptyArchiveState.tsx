import ArchiveIcon from 'assets/archive-icon.svg?react';

import styles from './EmptyArchiveState.module.scss';

export const EmptyArchiveState = () => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState__card}>
        <ArchiveIcon className={styles.emptyState__icon} />
        <div className={styles.emdivtyState__descr}>
          <h4 className={styles.emptyState__title}>Архив пуст</h4>
          <p className={styles.emptyState__text}>
            Сюда можно поместить проекты или списки задач. Они будут доступны в течение 90 дней и
            затем удалятся автоматически.
          </p>
        </div>
      </div>
    </div>
  );
};
