import ColumnIcon from 'assets/list-icon.svg?react';

import styles from './EmptyColumnState.module.scss';

export const EmptyColumnState = () => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState__card}>
        <ColumnIcon className={styles.emptyState__icon} />
        <div className={styles.emdivtyState__descr}>
          <h4 className={styles.emptyState__title}>Пока здесь ничего нет</h4>
          <p className={styles.emptyState__text}>
            Нажмите “Создать список”, чтобы начать отслеживать свои задачи
          </p>
        </div>
      </div>
    </div>
  );
};
