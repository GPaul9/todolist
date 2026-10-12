import { useEffect, useRef, useState } from 'react';

import { Column, useColumnActions } from 'entities/column';
import { useDialog } from 'shared/lib';

type TProps = {
  column: Column;
  onClick: () => void;
  onEdit: (status: boolean) => void;
};

export const useColumnTab = ({ column, onClick, onEdit }: TProps) => {
  const dialog = useDialog();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(column.title);
  const [error, setError] = useState<boolean>(false);

  const { actions, isAnyPending } = useColumnActions({
    projectId: column.project_id,
    listId: column.id,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const wasLongPressRef = useRef(false);

  const isArchived = column.status !== 'active';

  useEffect(() => {
    if (isEdit) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    onEdit(isEdit);
  }, [isEdit, onEdit]);

  useEffect(() => {
    const trimmed = title.trim();
    if (trimmed.length < 3 || trimmed.length > 100) {
      setError(true);
      return;
    }
    return setError(false);
  }, [title]);

  // actions
  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    if (trimmed !== column.title) await actions.update({ title: trimmed });
    setError(false);
    setIsEdit(false);
  };

  const handleDelete = async () => {
    const ok = await dialog.confirm({
      description: 'Вы уверены, что хотите удалить список со всеми прикрепленными задачами?',
    });
    if (ok) await actions.delete();
    setIsEdit(false);
  };

  const handleArchive = async () => {
    const ok = await dialog.confirm({
      description: 'Вы уверены, что хотите переместить список в архив?',
    });
    setIsEdit(false);
    if (ok) await actions.archive();
  };

  const handleUnArchive = async () => {
    const ok = await dialog.confirm({ description: 'Восстановить список из архива?' });
    setIsEdit(false);
    if (ok) await actions.unArchive();
  };

  // press
  const handleClick = () => {
    if (wasLongPressRef.current) return;
    onClick();
  };

  const startLongPress = () => {
    wasLongPressRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      wasLongPressRef.current = true;
      setIsEdit(true);
    }, 300);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCancel = () => {
    setError(false);
    setTitle(column.title);
    setIsEdit(false);
  };

  return {
    isArchived,
    isAnyPending,
    isEdit,
    title,
    setTitle,
    error,
    inputRef,
    startLongPress,
    cancelLongPress,
    handleClick,
    handleSave,
    handleArchive,
    handleDelete,
    handleCancel,
    handleUnArchive,
  };
};
