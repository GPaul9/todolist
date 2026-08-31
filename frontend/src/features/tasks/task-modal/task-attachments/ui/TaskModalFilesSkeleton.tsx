import Skeleton from 'react-loading-skeleton';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { skeletonColor } from 'app/styles/skeletonTheme';
import FileIcon from 'assets/file-icon.svg?react';

import styles from './TaskModalFiles.module.scss';

export const TaskModalFilesSkeleton = () => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  return (
    <div className={styles.files}>
      <div className={styles.files__top}>
        <div className={styles.files__left}>
          <FileIcon />
          <span className={styles.files__text}>Файлы</span>
        </div>
      </div>

      <div className={styles.files__fileCorrect}>
        {Array.from({ length: isMobile ? 2 : 4 }).map((_, index) => (
          <Skeleton key={index} width={100} height={56} baseColor={skeletonColor.light} />
        ))}
      </div>
    </div>
  );
};
