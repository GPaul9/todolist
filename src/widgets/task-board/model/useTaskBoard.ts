import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useReorderTask } from 'entities/task';
import { taskControlsSchema } from 'features/tasks';
import { parseParams, useDebounce } from 'shared/lib';

type TProps = {
  enableDnD: boolean;
};

export const useTaskBoard = ({ enableDnD }: TProps) => {
  const { mutate: taskReorderMutate } = useReorderTask();

  const [isDraggingTask, setIsDraggingTask] = useState(false);

  const [searchParams] = useSearchParams();
  const paramsObj = parseParams(searchParams, taskControlsSchema);
  const debouncedSearch = useDebounce(paramsObj.search, 400);
  const debouncedParams = useMemo(() => {
    return {
      ...paramsObj,
      search: debouncedSearch,
    };
  }, [paramsObj, debouncedSearch]);

  // drapNdrop
  const handleDragEnd = (event: any) => {
    setIsDraggingTask(false);

    if (!enableDnD) return;

    const { operation, canceled } = event;

    if (canceled) return;

    const task = operation.source?.data?.task;
    const fromListId = operation.source?.data?.fromListId;
    const toListId = operation.target?.id;

    if (!task || !toListId) return;
    if (fromListId === toListId) return;

    taskReorderMutate({
      taskData: task,
      taskId: task.id,
      data: {
        new_position: 0,
        new_task_list_id: toListId,
      },
    });
  };
  const handleDragStart = () => {
    setIsDraggingTask(true);
  };
  // ----------------------

  return {
    isDraggingTask,
    debouncedParams,
    handleDragEnd,
    handleDragStart,
  };
};
