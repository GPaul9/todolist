import Skeleton from 'react-loading-skeleton';

import { TaskCardSkeleton, TaskList } from 'features/tasks';

import styles from './TaskBoardMobile.module.scss';

export const TaskBoardMobileSkeleton = () => {
  return (
    <div className={styles.board}>
      <div className={styles.board__columns}>
        <Skeleton width={32} height={32} />
        <div className={styles['board__column-list-wrapper']}>
          <ul className={styles['board__column-list']}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={26} width={80} borderRadius={12} />
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.board__tasks}>
        <TaskList data={Array.from({ length: 2 })} getKey={(_, index) => index}>
          {() => <TaskCardSkeleton />}
        </TaskList>
      </div>
    </div>
  );
};
