import Skeleton from 'react-loading-skeleton';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { skeletonColor } from 'app/styles/skeletonTheme';
import CalenderIcon from 'assets/calender-icon.svg?react';

import styles from './TaskModalSubtasksDesktop.module.scss';

export const TaskModalSubtasksDesktopSkeleton = () => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.md });
  return (
    <div className={styles.subtask}>
      <div className={styles.subtask__top}>
        {isMobile ? <Skeleton width={24} height={24} /> : <CalenderIcon />}
        <span className={styles.subtask__text}>Подзадачи</span>
        {isMobile && <Skeleton width={40} height={24} />}
      </div>

      {!isMobile && (
        <div className={styles.subtask__input}>
          <Skeleton height={38} baseColor={skeletonColor.light} />
          <Skeleton width={200} height={20} baseColor={skeletonColor.light} />
        </div>
      )}

      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={styles.subtask__row}>
          <div className={styles.subtask__left}>
            <Skeleton width={24} height={24} inline />
            <Skeleton width={150} height={15} inline />
          </div>
          <Skeleton width={isMobile ? 40 : 50} height={isMobile ? 40 : 24} />
        </div>
      ))}
    </div>
  );
};
