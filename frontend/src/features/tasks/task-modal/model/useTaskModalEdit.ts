import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { Task, useTaskActions } from 'entities/task';
import { useMe } from 'entities/user';

import { useDialog } from 'shared/lib';

interface TProps {
  onClose: () => void;
  task: Task | null;
}

export const useTaskModalEdit = ({ task, onClose }: TProps) => {
  const { data: userData } = useMe();
  const dialog = useDialog();

  const isTablet = useMediaQuery({ maxWidth: breakpoints.md });
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  const { actions, isPending } = useTaskActions();

  if (!task) {
    return { task: null };
  }

  const isAllSubtasksDone = task.total_subtasks === task.completed_subtasks;
  const isTaskActive = task.status !== 'done';
  const isReadOnly = task.status === 'done' || !!task.archived_at;
  const isStatusDisabled = !!task.archived_at;
  const avatarUrl = userData?.avatar_path;

  const handleUpdate = async (fields: Partial<Task>) => {
    await actions.update({ taskId: task.id, data: fields });
  };

  const handleDelete = async () => {
    const ok = await dialog.confirm({
      description:
        'Вы действительно хотите удалить задачу и все содержащиеся в ней подзадачи, вложения?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
    });

    if (!ok) return;
    actions.delete({ listId: task.task_list_id, taskId: task.id });
    onClose();
  };

  const handleCompleteTask = async () => {
    await actions.update({ taskId: task.id, data: { status: 'done' } });
    onClose();
  };

  return {
    task,
    userData,
    avatarUrl,
    isTablet,
    isMobile,
    isAllSubtasksDone,
    isTaskActive,
    isReadOnly,
    isStatusDisabled,
    isPendingUpdate: isPending.update,
    taskActions: actions,
    handleUpdate,
    handleDelete,
    handleCompleteTask,
  };
};
