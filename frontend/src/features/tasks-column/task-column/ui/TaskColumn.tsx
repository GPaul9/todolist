import { useDroppable } from '@dnd-kit/react';
import clsx from 'clsx';
import { useState } from 'react';

import LinkIcon from 'assets/link-icon.svg?react';
import { Column, useColumnActions } from 'entities/column';
import { Task, useTasksList } from 'entities/task';
import { CreateTaskBtn, TaskCard, TaskControlsType, TaskList, TaskModalEdit } from 'features/tasks';
import { normalizeInfiniteData, useDialog } from 'shared/lib';
import { ArchiveIconBtn, DeleteIconBtn, InfinitePagination, TitleEdit } from 'shared/ui';

import styles from './TaskColumn.module.scss';

type TProps = {
  data: Column;
  params: TaskControlsType;
  onOpenProject: (projectId: number) => void;
};

export const TaskColumn = ({ data, params, onOpenProject }: TProps) => {
  const [openTaskId, setOpenTaskId] = useState<Task['id'] | null>(null);

  const { actions, isAnyPending } = useColumnActions({
    projectId: data.project_id,
    listId: data.id,
  });

  const dialog = useDialog();

  const isArchived = data.status !== 'active';
  const isByCascade =
    data.status === 'archived_by_cascade' || data.status === 'archived_by_user_and_cascade';
  const isByUser = data.status === 'archived_by_user';

  const {
    data: tasksData,
    hasNextPage: hasNextTaskPage,
    fetchNextPage: fetchNextTasksPage,
    isFetching: tasksPending,
  } = useTasksList({
    list_id: data.id,
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
    isArchived: isArchived,
  });

  // dragNdrop
  const { ref, isDropTarget } = useDroppable({
    id: data.id,
  });
  // -----------------

  const normalizeTasksData = normalizeInfiniteData(tasksData);

  const openTaskData = normalizeTasksData.find((task) => task.id === openTaskId) ?? null;

  const handleArchive = async () => {
    const ok = await dialog.confirm({
      description: 'Вы уверены, что хотите переместить список в архив?',
    });
    if (ok) await actions.archive();
  };

  const handleUnArchive = async () => {
    const ok = await dialog.confirm({ description: 'Восстановить список из архива?' });
    if (ok) await actions.unArchive();
  };

  const handleDelete = async () => {
    const ok = await dialog.confirm({
      description: 'Вы уверены, что хотите удалить список со всеми прикрепленными задачами?',
    });
    if (ok) await actions.delete();
  };

  return (
    <div className={styles.column}>
      <div className={styles.column__header}>
        <div className={styles.column__info}>
          <div className={styles['column__info-row']}>
            <TitleEdit
              value={data.title}
              onSave={(value) => actions.update({ title: value })}
              disabled={isArchived}
            />

            {isArchived && <DeleteIconBtn onClick={handleDelete} disabled={isAnyPending} />}
            {!isByCascade && (
              <ArchiveIconBtn
                onClick={isArchived ? handleUnArchive : handleArchive}
                isArchived={isArchived}
                disabled={isAnyPending}
              />
            )}
          </div>
          {isByUser && (
            <div className={clsx(styles['column__info-row'], styles['column__info-row_right'])}>
              <button
                className={styles['column__project-btn']}
                onClick={() => onOpenProject(data.project_id)}
              >
                Проект <LinkIcon />
              </button>
            </div>
          )}
        </div>

        {!isArchived && (
          <div className={styles.column__actions}>
            <CreateTaskBtn listId={data.id} />
          </div>
        )}
      </div>

      <div
        className={clsx(
          styles['column__tasks-wrapper'],
          isDropTarget && styles['column__tasks-wrapper_drop'],
        )}
      >
        <div ref={ref} className={styles.column__tasks}>
          <TaskList data={normalizeTasksData} getKey={(task) => task.id}>
            {(task) => <TaskCard task={task} onEdit={(task) => setOpenTaskId(task.id)} />}
          </TaskList>

          <InfinitePagination
            loaderSize={40}
            hasNextPage={hasNextTaskPage}
            onFetch={fetchNextTasksPage}
            isLoading={tasksPending}
          />
        </div>
      </div>

      <TaskModalEdit
        isOpen={!!openTaskId}
        task={openTaskData}
        onClose={() => setOpenTaskId(null)}
      />
    </div>
  );
};
