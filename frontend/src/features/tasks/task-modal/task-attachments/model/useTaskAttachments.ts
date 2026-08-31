import { useState, useRef } from 'react';
import { useDialog } from 'shared/lib';
import {
  Task,
  useDelTaskAttachment,
  useGetTaskAttachments,
  useUploadTaskAttachment,
} from 'entities/task';
import { useDownloadAttachment } from 'entities/attachment';
import { useOverlayClose } from '../../model/useOverlayClose';
import { validateFile } from 'shared/lib/validateFile';
import { boolean } from 'zod';

interface TProps{
  taskId: number;
  taskListId: number;
  disabled: boolean;
}

export const useTaskAttachments = ({taskId, taskListId, disabled}:TProps) => {
  const dialog = useDialog();

  const { data: attachments = [], isLoading } = useGetTaskAttachments(taskId);
  const { mutateAsync: uploadFile } = useUploadTaskAttachment();
  const { mutate: downloadFile, isPending: isDownloading } = useDownloadAttachment();
  const { mutate: deleteFile, isPending: isDeleting } = useDelTaskAttachment();

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropzoneRef = useRef<HTMLDivElement>(null);

  useOverlayClose({
    isOpen,
    hasError: Boolean(error),
    targetRef: dropzoneRef,
    onClose: () => setIsOpen(false),
    onClearError: () => setError(null),
  });

  const toggleOpen = () => {
    if (disabled) return;

    if (attachments?.length >= 5 && !isOpen) {
      setError('Максимум 5 вложений');
      return;
    }

    setIsOpen((prev) => !prev);
    setError(null);
  };

  const handleAddFile = async (file: File) => {
    if (disabled) return;

    const fileError = validateFile(file, attachments?.length);
    if (fileError) {
      setError(fileError);
      return;
    }
    setError(null);

    await uploadFile({ file, taskId, listId: taskListId });
    setIsOpen(false);
  };

  const handleFileDelete = async (fileId: string) => {
    if (disabled) return;

    const ok = await dialog.confirm({
      description: 'Вы действительно хотите удалить вложение?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
    });

    if (!ok) return;

    deleteFile({ taskId, attachmentId: fileId });
  };

  return {
    attachments,
    isLoading,
    isOpen,
    error,
    dropzoneRef,
    isDownloading: isDownloading || isDeleting,
    toggleOpen,
    handleAddFile,
    handleFileDelete,
    downloadFile,
  };
};
