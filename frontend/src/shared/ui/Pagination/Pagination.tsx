import clsx from 'clsx';

import ControlIcon from 'assets/pagination-control-icon.svg?react';

import styles from './Pagination.module.scss';

type TProps = {
  currentPage: number;
  totalPage: number;
  onFetch: (page: number) => void;
};

export const Pagination = ({ currentPage, totalPage, onFetch }: TProps) => {
  const getPages = (): number[] => {
    const pages: number[] = [];

    let start = currentPage - 1;
    let end = currentPage + 1;

    if (start < 1) {
      end += 1 - start;
      start = 1;
    }

    if (end > totalPage) {
      start -= end - totalPage;
      end = totalPage;
    }

    start = Math.max(start, 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      <div className={styles.pagination__content}>
        <button
          className={styles.pagination__control}
          onClick={() => onFetch(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Предыдущая страница"
        >
          <ControlIcon className={styles.pagination__icon} />
        </button>
        <div className={styles.pagination__pages}>
          {getPages().map((page) => (
            <button
              key={page}
              className={clsx(
                styles.pagination__item,
                page === currentPage && styles.pagination__item_current,
              )}
              onClick={() => onFetch(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          className={styles.pagination__control}
          onClick={() => onFetch(currentPage + 1)}
          disabled={currentPage === totalPage}
          aria-label="Следующая страница"
        >
          <ControlIcon className={clsx(styles.pagination__icon, styles.pagination__icon_next)} />
        </button>
      </div>
    </div>
  );
};
