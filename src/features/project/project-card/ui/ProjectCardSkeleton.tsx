import Skeleton from 'react-loading-skeleton';

import styles from './ProjectCardSkeleton.module.scss';

export const ProjectCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.card__header}>
        <div className={styles.card__row}>
          <div className={styles.card__title}>
            <Skeleton height={16} />
          </div>

          <div className={styles.card__hints}>
            <Skeleton height={8} />
          </div>
        </div>

        <div className={styles.card__hints}>
          <Skeleton height={8} />
        </div>
      </div>

      <div className={styles.card__body}>
        <div className={styles.card__descr}>
          <Skeleton height={12} />
        </div>
        <div className={styles.card__descr}>
          <Skeleton height={12} />
        </div>
      </div>

      <div className={styles.card__footer}>
        <div className={styles.card__row}>
          <div className={styles.card__descr}>
            <Skeleton height={12} />
          </div>
          <div className={styles.card__icon}>
            <Skeleton height={24} circle={true} />
          </div>
        </div>

        <div className={styles.card__row}>
          <div className={styles.card__btn}>
            <Skeleton height={35} />
          </div>

          <div className={styles.card__actions}>
            <div className={styles.card__icon}>
              <Skeleton height={24} />
            </div>
            <div className={styles.card__icon}>
              <Skeleton height={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
