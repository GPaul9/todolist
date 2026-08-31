import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import CrossIcon from 'assets/cross-icon.svg?react';
import { Subtask } from 'entities/subtask';
import { Task } from 'entities/task';
import { tooltip } from 'shared/lib';
import { Modal, Button, FileDropzone, FileCard } from 'shared/ui';
import { useSubtaskAttachmentsMobile } from '../model/useSubtaskAttachmentsMobile';
import styles from './SubtaskFilesModal.module.scss';

interface TProps {
  trigger: ReactNode;
  sub: Subtask;
  task: Task;
  className?: string;
  disabled?: boolean;
}

export const SubtaskFilesModal = ({ trigger, sub, task, className, disabled = false }: TProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  const {
    isOpen,
    setIsOpen,
    error,
    isPending,
    isDownloading,
    downloadFile,
    handleClose,
    handleAddFile,
    handleFileDelete,
  } = useSubtaskAttachmentsMobile({ sub, task, disabled });

  return (
    <>
      <motion.button
        variants={tooltip}
        initial="initial"
        animate="animate"
        exit="exit"
        type="button"
        className={clsx(styles.files__trigger, className)}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {trigger}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <Modal
            className={styles.files}
            isOpen={isOpen}
            onClose={handleClose}
            modeY={isMobile ? 'bottom' : 'center'}
          >
            <button className={styles.files__close} onClick={handleClose}>
              <CrossIcon />
            </button>
            <h2 className={styles.files__title}>Вложения подзадачи</h2>

            <Button
              className={styles.files__add}
              kind="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending.addAttachment || (sub.attachments?.length ?? 0) >= 1}
            >
              Добавить вложения
            </Button>

            <FileDropzone
              inputRef={fileInputRef}
              onFileSelect={handleAddFile}
              disabled={disabled || isPending.addAttachment || (sub.attachments?.length ?? 0) >= 1}
              onlyInput
            />

            {error && <span className={styles.files__fileError}>{error}</span>}

            <div className={styles.files__fileBlock}>
              {sub.attachments?.map((file) => (
                <FileCard
                  key={file.id}
                  id={file.id}
                  name={file.original_filename}
                  size={file.size}
                  disabled={disabled}
                  isDownloading={isDownloading}
                  onDownload={downloadFile}
                  onDelete={handleFileDelete}
                />
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};
