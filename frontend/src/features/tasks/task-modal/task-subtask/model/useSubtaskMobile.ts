import { useState, KeyboardEvent } from 'react';
import { useGetSubtask, useSubtaskActions } from 'entities/subtask';

import { Task } from 'entities/task';

interface TProps {
  task: Task;
  disabled?: boolean;
}

export const useSubtaskMobile = ({ task, disabled = false }: TProps) => {
  const { data: subtasks = [], isLoading } = useGetSubtask(task.id);
  const { actions, isPending } = useSubtaskActions();

  const [editSubtask, setEditSubtask] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteMode, setDeleteMode] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleAdd = async () => {
    if (disabled) return;

    await actions.create({
      taskId: task.id,
      data: { title: 'Новая подзадача', status: 'todo' },
    });
    setEditValue('');
  };

  const handleToggle = async (subId: number) => {
    if (disabled) return;
    const sub = subtasks.find((s) => s.id === subId);
    if (!sub) return;

    await actions.update({
      subtaskId: sub.id,
      data: { status: sub.status === 'done' ? 'todo' : 'done' },
    });
  };

  const handleEdit = async (subId: number) => {
    if (editSubtask === null) return;
    
    if (disabled) return;
    const trimmed = editValue.trim();
    const length = editValue.trim().length;

    if (length < 3) {
      setErrorMessage('Минимум 3 символа');
      return;
    }

    if (length > 100) {
      setErrorMessage('Максимум 100 символов');
      return;
    }

    if (trimmed !== subtasks.find((s) => s.id === subId)?.title) {
      await actions.update({
        subtaskId: subId,
        data: { title: trimmed },
      });
    }
    setErrorMessage(undefined);
    setEditSubtask(null);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>, subId: number) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleEdit(subId);
    if (e.key === 'Escape') {
      setEditSubtask(null);
      setErrorMessage(undefined);
    }
  };

  const handleTextClick = (e: React.MouseEvent, subId: number, subTitle: string) => {
    e.stopPropagation();
    if (disabled) return;
    setEditSubtask(subId);
    setEditValue(subTitle);
  };

  const handleDelete = async (subId: number) => {
    if (disabled) return;
    await actions.delete(subId);
  };

  return {
    subtasks,
    isLoading,
    isPending,
    editSubtask,
    setEditSubtask,
    editValue,
    setEditValue,
    deleteMode,
    setDeleteMode,
    errorMessage,
    setErrorMessage,
    handleAdd,
    handleEdit,
    handleToggle,
    handleInputKeyDown,
    handleTextClick,
    handleDelete,
  };

};
