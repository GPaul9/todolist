import { useState, useRef, KeyboardEvent } from 'react';
import { useDialog } from 'shared/lib';
import { useDownloadAttachment } from 'entities/attachment';
import { useGetSubtask, useSubtaskActions } from 'entities/subtask';
import { useOverlayClose } from '../../model/useOverlayClose';
import { validateFile } from 'shared/lib/validateFile';

import { Task } from 'entities/task';

interface TProps {
  task: Task;
  disabled?: boolean;
}

export const useSubtaskAttachmentsDesktop = ({task, disabled = false}:TProps) => {
  const dialog = useDialog();

  const { data: subtasks = [], isLoading } = useGetSubtask(task.id);
  const { actions, isPending } = useSubtaskActions();
  const { mutate: downloadFile, isPending: isDownloading } = useDownloadAttachment();

  const [searchValue, setSearchValue] = useState('');
  const [uploadFile, setUploadFile] = useState<number | null>(null);
  const [error, setError] = useState<{ id: number; message: string } | null>(null);
  const [listSubtask, setListSubtask] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const dropzoneRef = useRef<HTMLDivElement>(null);

  const sortedSubtasks = [...subtasks].sort((a, b) => a.id - b.id);

  useOverlayClose({
    isOpen: uploadFile !== null || listSubtask !== null,
    hasError: Boolean(error),
    targetRef: dropzoneRef,
    onClose: () => {
      setUploadFile(null);
      setListSubtask(null);
    },
    onClearError: () => setError(null),
  });

  const handleEdit = async (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      const length = searchValue.trim().length;

      if (length < 3) {
        setErrorMessage('Минимум 3 символа');
        return;
      }

      if (length > 100) {
        setErrorMessage('Максимум 100 символов');
        return;
      }

      await actions.create({
        taskId: task.id,
        data: { title: searchValue.trim(), status: 'todo' },
      });
      setSearchValue('');
      setErrorMessage(undefined);
    }

    if (e.key === 'Escape') {
      e.stopPropagation();
      setSearchValue('');
      setErrorMessage(undefined);
    }
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

  const handleDelete = async (id: number) => {
    if (disabled) return;
    await actions.delete(id);
  };

  const handleAddFile = async (subId: number, file: File) => {
    if (disabled) return;

    const currentSubtask = subtasks.find((s) => s.id === subId);
    const currentFilesCount = currentSubtask?.attachments?.length ?? 0;

    const fileError = validateFile(file, currentFilesCount, true);
    if (fileError) {
      setError({ id: subId, message: fileError });
      return;
    }
    setError(null);

    await actions.addAttachment({
      file,
      subtaskId: subId,
      taskId: task.id,
    });

    setUploadFile(null);
  };

  const handleFileDelete = async (subId: number, attachmentId: string) => {
    if (disabled) return;
    const ok = await dialog.confirm({
      description: 'Вы действительно хотите удалить вложение?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
    });

    if (!ok) return;
    await actions.delAttachment({ subtaskId: subId, attachmentId });
  };

  const handleShow = (subId: number) => {
    const currentSub = subtasks?.find((s) => s.id === subId);
    const hasFiles = (currentSub as any)?.attachments?.length > 0;

    if (listSubtask === subId) {
      setListSubtask(null);
      setUploadFile(null);
      setError(null);
    } else {
      setListSubtask(subId);

      if (!hasFiles) {
        setUploadFile(subId);
      } else {
        setUploadFile(null);
      }
    }
  };

  return {
    isLoading,
    sortedSubtasks,
    searchValue,
    setSearchValue,
    errorMessage,
    setErrorMessage,
    handleEdit,
    uploadFile,
    setUploadFile,
    listSubtask,
    error,
    dropzoneRef,
    isPending,
    isDownloading,
    downloadFile,
    handleToggle,
    handleDelete,
    handleAddFile,
    handleFileDelete,
    handleShow,
  };
};
