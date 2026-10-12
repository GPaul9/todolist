import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Column } from 'entities/column';
import { GetColumnsResponce } from 'entities/column/api/columnApi';
import { Task, useTasksList } from 'entities/task';
import {
  CreateTaskBtnAbsolute,
  TaskCard,
  TaskControlsType,
  TaskList,
  TaskModalEdit,
} from 'features/tasks';
import { ColumnTab } from 'features/tasks-column/column-tab/ui/ColumnTab';
import { CreateColumnBtnIcon } from 'features/tasks-column/create-column-btn/ui/CreateColumnBtnIcon';
import { normalizeInfiniteData } from 'shared/lib';
import { EmptyArchiveState, EmptyColumnState, InfinitePagination, Overlay } from 'shared/ui';

import styles from './TaskBoardMobile.module.scss';
import { TaskBoardMobileSkeleton } from './TaskBoardMobileSkeleton';

type TProps = {
  dataQuery: UseInfiniteQueryResult<InfiniteData<GetColumnsResponce>>;
  params: TaskControlsType;
  isArchive: boolean;
  isDraggingTask?: boolean;
};

export const TaskBoardMobile = ({ dataQuery, params, isArchive, isDraggingTask }: TProps) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetching } = dataQuery;
  const columnsData = normalizeInfiniteData(data);

  const [activeColumn, setActiveColumn] = useState<Column | null>(columnsData[0] ?? null);
  const [isEditColumn, setIsEditColumn] = useState<boolean>(false);
  const [openTaskId, setOpenTaskId] = useState<Task['id'] | null>(null);

  const {
    data: tasksData,
    hasNextPage: hasNextTaskPage,
    fetchNextPage: fetchNextTasksPage,
    isFetching: tasksPending,
  } = useTasksList({
    list_id: activeColumn?.id || 0,
    params: {
      search: params.search,
      status: params.sts,
      priority: params.priority,
      date_from: params.date_from,
      date_to: params.date_to,
      tags_ids: params.tags_ids,
      sort_by: params.sort_by,
      order: params.order,
      size: 6,
    },
    isArchived: activeColumn?.status !== 'active',
  });

  useEffect(() => {
    if (!columnsData.length) {
      setActiveColumn(null);
      return;
    }

    const activeExists = columnsData.some(
      (column) => column.id === activeColumn?.id,
    );

    if (!activeExists) {
      setActiveColumn(columnsData[0]);
    }
  }, [columnsData, activeColumn]);

  const { id } = useParams();
  const projectId = Number(id);

  const normalizeTasksData = normalizeInfiniteData(tasksData);

  const openTaskData = normalizeTasksData.find((task) => task.id === openTaskId) ?? null;

  if (isLoading) return <TaskBoardMobileSkeleton />;

  return (
    <div className={styles.board}>
      <div className={styles.board__columns}>
        {!isArchive && <CreateColumnBtnIcon projectId={projectId} disabled={isEditColumn} />}

        <div
          className={clsx(
            styles['board__column-list-wrapper'],
            isEditColumn && styles['board__column-list-wrapper_edit'],
          )}
        >
          <ul className={styles['board__column-list']}>
            {columnsData.map((column) => (
              <li
                key={column.id}
                className={clsx(
                  styles['board__column-item'],
                  isDraggingTask && styles['board__column-item_drop'],
                )}
              >
                <ColumnTab
                  column={column}
                  isActive={activeColumn?.id === column.id}
                  onClick={() => setActiveColumn(column)}
                  onEdit={(isEdit) => setIsEditColumn(isEdit)}
                />
              </li>
            ))}
          </ul>

          <InfinitePagination
            loaderSize={18}
            hasNextPage={hasNextPage}
            onFetch={fetchNextPage}
            isLoading={isFetching}
          />
        </div>
      </div>

      {!columnsData.length && !isArchive && <EmptyColumnState />}
      {!columnsData.length && isArchive && <EmptyArchiveState />}
      {!!columnsData.length && tasksData && (
        <div className={styles.board__tasks}>
          <TaskList data={normalizeTasksData} getKey={(task) => task.id}>
            {(task) => <TaskCard task={task} onEdit={(task) => setOpenTaskId(task.id)} />}
          </TaskList>

          <InfinitePagination
            loaderSize={35}
            hasNextPage={hasNextTaskPage}
            onFetch={fetchNextTasksPage}
            isLoading={tasksPending}
          />
        </div>
      )}

      <TaskModalEdit
        isOpen={!!openTaskId}
        task={openTaskData}
        onClose={() => setOpenTaskId(null)}
      />

      {activeColumn && !isArchive && <CreateTaskBtnAbsolute listId={activeColumn.id} />}

      {isDraggingTask && (
        <>
          <Overlay zIndex={160} />
          <p className={styles['board__drag-helper']}>
            Удерживайте и перетащите карточку в другой список
          </p>
        </>
      )}
    </div>
  );
};
