import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import PaperclipIcon from 'assets/attachment-icon.svg?react';
import CalenderIcon from 'assets/calender-icon.svg?react';
import CreateIcon from 'assets/create-icon.svg?react';
import CrossIcon from 'assets/cross-icon.svg?react';
import { Task } from 'entities/task';
import { accordion } from 'shared/lib';
import { Input, FileDropzone, FileCard } from 'shared/ui';

import styles from './TaskModalSubtasksDesktop.module.scss';
import { TaskModalSubtasksDesktopSkeleton } from './TaskModalSubtasksDesktopSkeleton';
import { useSubtaskAttachmentsDesktop } from '../model/useSubtaskAttachmentsDesktop';

interface TProps {
  task: Task;
  disabled?: boolean;
}

export const TaskModalSubtasksDesktop = ({ task, disabled = false }: TProps) => {
  const {
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
  } = useSubtaskAttachmentsDesktop({task, disabled});

  if (isLoading) return <TaskModalSubtasksDesktopSkeleton />;

  return (
    <div className={styles.subtask}>
      <div className={styles.subtask__top}>
        <CalenderIcon />
        <span className={styles.subtask__text}>Подзадачи</span>
      </div>

      {!disabled && (
        <Input
          className={styles.subtasks__input}
          placeholder="Введите название подзадачи"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setErrorMessage(undefined);
          }}
          onKeyDown={handleEdit}
          disabled={isPending.create}
          helpText="Enter чтобы добавить подзадачу"
          errorMessage={errorMessage}
          status={errorMessage ? 'error' : 'default'}
        />
      )}

      <div className={styles.subtask__list}>
        {sortedSubtasks.map((sub) => (
          <div
            key={sub.id}
            className={styles.subtask__item}
            ref={listSubtask === sub.id || uploadFile === sub.id ? dropzoneRef : null}
          >
            <div className={styles.subtask__row}>
              <div className={styles.subtask__left}>
                <input
                  type="checkbox"
                  checked={sub.status === 'done'}
                  className={styles.subtask__checkbox}
                  onChange={() => handleToggle(sub.id)}
                  disabled={disabled}
                />

                <span className={clsx(styles.subtask__name, sub.status === 'done' && styles.done)}>
                  {sub.title}
                </span>
              </div>

              <div className={styles.subtask__actions}>
                {!(disabled && !sub.attachments?.length) && (
                  <button
                    className={clsx(
                      styles.subtask__attach,
                      sub.attachments?.length > 0 && styles.active,
                    )}
                    onClick={() => handleShow(sub.id)}
                  >
                    <PaperclipIcon />
                  </button>
                )}

                {!disabled && (
                  <button className={styles.subtask__delete} onClick={() => handleDelete(sub.id)}>
                    <CrossIcon />
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {listSubtask === sub.id && (
                <motion.div
                  key={`container-${sub.id}`}
                  variants={accordion}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={styles.subtask__container}
                >
                  <AnimatePresence>
                    {!disabled && (!sub.attachments?.length || uploadFile === sub.id) && (
                      <FileDropzone
                        disabled={disabled}
                        onFileSelect={(file) => handleAddFile(sub.id, file)}
                      />
                    )}
                  </AnimatePresence>

                  <div className={styles.subtask__fileBlock}>
                    <div className={styles.subtask__fileCorrect}>
                      {sub.attachments?.map((file) => (
                        <FileCard
                          key={file.id}
                          id={file.id}
                          name={file.original_filename}
                          size={file.size}
                          disabled={disabled}
                          isDownloading={isDownloading}
                          onDownload={downloadFile}
                          onDelete={(id) => handleFileDelete(sub.id, id)}
                        />
                      ))}

                      {sub.attachments?.length > 0 && (
                        <button
                          className={styles.subtask__creat}
                          onClick={() => setUploadFile(uploadFile === sub.id ? null : sub.id)}
                          disabled={isPending.addAttachment || (sub.attachments?.length ?? 0) >= 1}
                        >
                          <CreateIcon />
                        </button>
                      )}
                    </div>

                    {error?.id === sub.id && (
                      <span className={styles.subtask__fileError}>{error.message}</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};
