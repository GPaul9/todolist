import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';

import { GetColumnsResponce } from 'entities/column/api/columnApi';
import { TaskControlsType } from 'features/tasks';
import { ColumnList, TaskColumn } from 'features/tasks-column';
import { normalizeInfiniteData } from 'shared/lib';
import { EmptyArchiveState, EmptyColumnState, InfinitePagination } from 'shared/ui';

import styles from './TaskBoardDesktop.module.scss';
import { TaskBoardDesktopSkeleton } from './TaskBoardDesktopSkeleton';

type TProps = {
  dataQuery: UseInfiniteQueryResult<InfiniteData<GetColumnsResponce>>;
  params: TaskControlsType;
  isArchive: boolean;
  onOpenProject: (projectId: number) => void;
};

export const TaskBoardDesktop = ({ dataQuery, params, isArchive, onOpenProject }: TProps) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetching } = dataQuery;
  const columnsData = normalizeInfiniteData(data);

  if (isLoading) return <TaskBoardDesktopSkeleton />;

  return (
    <>
      {!columnsData.length && !isArchive && <EmptyColumnState />}
      {!columnsData.length && isArchive && <EmptyArchiveState />}
      {!!columnsData. length &&
        <div className={styles.board}>
          <ColumnList data={columnsData} getKey={(column) => column.id}>
            {(column) => <TaskColumn data={column} params={params} onOpenProject={onOpenProject} />}
          </ColumnList>

          <InfinitePagination
            hasNextPage={hasNextPage}
            onFetch={fetchNextPage}
            isLoading={isFetching}
          />
        </div>
      }
    </>
  );
};
