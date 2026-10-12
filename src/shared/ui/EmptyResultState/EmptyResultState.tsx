import SearchIcon from 'assets/search-icon.svg?react';

import styles from './EmptyResultState.module.scss';

export const EmptyResultState = () => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState__card}>
        <SearchIcon className={styles.emptyState__icon} />
        <p className={styles.emptyState__descr}>
          <span className={styles.emptyState__text}>Нет результатов по вашему запросу.</span>
          <span className={styles.emptyState__text}>
            Проверьте корректность или попробуйте убрать некоторые фильтры.
          </span>
        </p>
      </div>
    </div>
  );
};
