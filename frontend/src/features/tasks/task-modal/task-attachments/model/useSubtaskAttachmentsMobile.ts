import { useState } from 'react';
import { Subtask, useSubtaskActions } from 'entities/subtask';
import { Task } from 'entities/task';
import { useDialog } from 'shared/lib';
import { useDownloadAttachment } from 'entities/attachment';
import { validateFile } from 'shared/lib/validateFile';

interface TProps {
  sub: Subtask;
  task: Task;
  disabled: boolean;
}

export const useSubtaskAttachmentsMobile = ({ sub, task, disabled =false}: TProps) => {
  const dialog = useDialog();

  const { actions, isPending } = useSubtaskActions();
  const { mutate: downloadFile, isPending: isDownloading } = useDownloadAttachment();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleAddFile = async (file: File) => {
    if (disabled) return;

    const fileError = validateFile(file, sub.attachments?.length ?? 0, true);
    if (fileError) {
      setError(fileError);
      return;
    }

    setError(null);

    await actions.addAttachment({
      file,
      subtaskId: sub.id,
      taskId: task.id,
    });
  };

  const handleFileDelete = async (fileId: string) => {
    const ok = await dialog.confirm({
      description: 'Вы действительно хотите удалить вложение?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
    });

    if (!ok) return;
    await actions.delAttachment({ subtaskId: sub.id, attachmentId: fileId });
  };

  return {
    isOpen,
    setIsOpen,
    error,
    isPending,
    isDownloading,
    downloadFile,
    handleClose,
    handleAddFile,
    handleFileDelete,
  };
};
