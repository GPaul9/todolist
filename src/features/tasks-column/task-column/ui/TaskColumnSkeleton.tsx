import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';

import { TaskCardSkeleton, TaskList } from 'features/tasks';

import styles from './TaskColumnSkeleton.module.scss';

export const TaskColumnSkeleton = () => {
  return (
    <div className={styles.column}>
      <div className={styles.column__header}>
        <div className={clsx(styles.column__row, styles.column__title)}>
          <Skeleton width={194} height={18} inline />
          <Skeleton width={24} height={24} inline />
        </div>
        <div className={clsx(styles.column__row, styles.column__row_center)}>
          <Skeleton width={92} height={16} inline />
          <Skeleton width={24} height={24} inline />
        </div>
      </div>

      <div className={styles.column__tasks}>
        <TaskList data={Array.from({ length: 2 })} getKey={(_, index) => index}>
          {() => <TaskCardSkeleton />}
        </TaskList>
      </div>
    </div>
  );
};
