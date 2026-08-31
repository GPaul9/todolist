import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';

import { skeletonColor } from 'app/styles/skeletonTheme';

import styles from './TaskCardSkeleton.module.scss';

export const TaskCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.card__status}>
        <Skeleton width={136} height={24} />
      </div>

      <div className={styles.card__title}>
        <Skeleton width={100} height={16} />
      </div>

      <div className={clsx(styles.card__row, styles.card__priority)}>
        <Skeleton width={65} height={10} />
        <Skeleton width={65} height={10} />
      </div>

      <div className={clsx(styles.card__row, styles.card__subtasks)}>
        <Skeleton width={24} height={24} inline />
        <Skeleton width={90} height={10} borderRadius={12} inline />
      </div>

      <div className={styles.card__deadline}>
        <Skeleton height={4} baseColor={skeletonColor.light} />
      </div>

      <div className={clsx(styles.card__row)}>
        <div className={clsx(styles.card__row, styles.card__subtasks)}>
          <Skeleton width={24} height={24} inline />
          <Skeleton width={65} height={10} borderRadius={12} inline />
        </div>
        <div className={clsx(styles.card__row, styles.card__totals)}>
          <Skeleton width={24} height={24} inline baseColor={skeletonColor.light} />
          <Skeleton width={24} height={24} inline baseColor={skeletonColor.light} />
        </div>
      </div>

      <div className={clsx(styles.card__row, styles.card__tags)}>
        <Skeleton width={80} height={24} borderRadius={12} inline baseColor={skeletonColor.light} />
        <Skeleton width={80} height={24} borderRadius={12} inline baseColor={skeletonColor.light} />
        <Skeleton width={80} height={24} borderRadius={12} inline baseColor={skeletonColor.light} />
      </div>

      <div className={styles.card__row}>
        <div className={styles.card__actions}>
          <Skeleton height={36} inline />
        </div>
        <div className={styles.card__actions}>
          <Skeleton height={36} inline />
        </div>
      </div>
    </div>
  );
};
