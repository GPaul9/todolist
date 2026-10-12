import { AnimatePresence } from 'framer-motion';

import CreateIcon from 'assets/create-icon.svg?react';
import FileIcon from 'assets/file-icon.svg?react';
import { Task } from 'entities/task';

import styles from './TaskModalFiles.module.scss';
import { TaskModalFilesSkeleton } from './TaskModalFilesSkeleton';
import { FileDropzone, FileCard } from 'shared/ui';
import { useTaskAttachments } from '../model/useTaskAttachments';

interface TProps {
  task: Task;
  disabled?: boolean;
}

export const TaskModalFilesMobile = ({ task, disabled = false }: TProps) => {
  const {
    attachments,
    isLoading,
    isOpen,
    error,
    dropzoneRef,
    isDownloading,
    toggleOpen,
    handleAddFile,
    handleFileDelete,
    downloadFile,
  } = useTaskAttachments({taskId: task.id, taskListId: task.task_list_id, disabled});

  if (isLoading) return <TaskModalFilesSkeleton />;

  return (
    <div className={styles.files}>
      <div className={styles.files__top}>
        <div className={styles.files__left}>
          <FileIcon />
          <span className={styles.files__text}>Файлы</span>
        </div>

        {!disabled && (
          <button className={styles.files__btn} onClick={toggleOpen}>
            Добавить
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && !(attachments?.length >= 5) && (
          <FileDropzone
            forwardedRef={dropzoneRef}
            disabled={disabled}
            onFileSelect={handleAddFile}
            isMobile
          />
        )}
      </AnimatePresence>

      <div className={styles.files__list}>
        <div className={styles.files__fileCorrect}>
          <AnimatePresence>
            {attachments.map((file) => (
              <FileCard
                key={file.id}
                id={file.id}
                name={file.original_filename}
                size={file.size}
                disabled={disabled}
                isDownloading={isDownloading}
                onDownload={downloadFile}
                onDelete={handleFileDelete}
                animate
              />
            ))}
          </AnimatePresence>

          {attachments.length > 0 && !disabled && (
            <button
              className={styles.files__creat}
              onClick={toggleOpen}
              disabled={attachments?.length >= 5}
            >
              <CreateIcon />
            </button>
          )}
        </div>

        {error && <span className={styles.files__fileError}>{error}</span>}
      </div>
    </div>
  );
};
