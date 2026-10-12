import { ColumnList, TaskColumnSkeleton } from 'features/tasks-column';

import styles from './TaskBoardDesktop.module.scss';

export const TaskBoardDesktopSkeleton = () => {
  return (
    <div className={styles.board}>
      <ColumnList data={Array.from({ length: 3 })} getKey={(_, index) => index}>
        {() => <TaskColumnSkeleton />}
      </ColumnList>
    </div>
  );
};
