import Skeleton from 'react-loading-skeleton';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { skeletonColor } from 'app/styles/skeletonTheme';

import styles from './ProjectModalEditSkeleton.module.scss';

export const ProjectModalEditSkeleton = () => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  return (
    <div className={styles.modal__content}>
      <div className={styles.modal__header}>
        <div className={styles.modal__title}>
          <Skeleton baseColor={skeletonColor.light} height={24} />
        </div>
        <div className={styles.modal__date}>
          <Skeleton baseColor={skeletonColor.light} height={16} width={193} />
        </div>
        <div className={styles.modal__status}>
          <Skeleton inline={true} height={24} width={83} />
          <Skeleton baseColor={skeletonColor.light} inline={true} height={24} width={74} />
        </div>
        <div className={styles.modal__descr}>
          <Skeleton
            className={styles['skeleton-descr']}
            enableAnimation={false}
            baseColor={skeletonColor.light}
            height={70}
          />
        </div>
        <Skeleton height={16} width={100} />
      </div>

      <div className={styles.modal__footer}>
        <Skeleton inline={true} baseColor={skeletonColor.light} height={40} width={82} />
        <Skeleton inline={true} height={40} width={isMobile ? 160 : 203} />
      </div>
    </div>
  );
};
