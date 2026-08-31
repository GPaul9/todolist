import { useRef, DragEvent, RefObject } from 'react';
import { motion } from 'framer-motion';
import { accordion } from 'shared/lib';
import FolderIcon from 'assets/folder-icon.svg?react';
import styles from './FileDropzone.module.scss';

interface TProps {
  disabled?: boolean;
  accept?: string;
  onFileSelect: (file: File) => void;
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
  inputRef?: RefObject<HTMLInputElement | null>;
  isMobile?: boolean;
  onlyInput?: boolean;
}

export const FileDropzone = ({
  disabled = false,
  accept = '.jpg,.jpeg,.png,.gif,.pdf,.txt,.docx,.xlsx,.pptx',
  onFileSelect,
  forwardedRef,
  inputRef,
  isMobile = false,
  onlyInput = false,
}: TProps) => {
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = inputRef || localInputRef;

  const handleZoneClick = () => {
    if (!disabled) activeInputRef.current?.click();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    const file = e.dataTransfer?.files[0];
    if (file) onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  const drageEvents = isMobile ? {} : { onDragOver: handleDragOver, onDrop: handleDrop };

  if (onlyInput) {
    return (
      <input type="file" ref={activeInputRef} hidden onChange={handleInputChange} accept={accept} />
    );
  }

  return (
    <motion.div
      variants={accordion}
      initial="initial"
      animate="animate"
      exit="exit"
      ref={forwardedRef}
      className={styles.drop__dropzone}
    >
      <div className={styles.drop__dropzoneInner} onClick={handleZoneClick} {...drageEvents}>
        <FolderIcon />
        <div className={styles.drop__file}>
          {isMobile ? (
            <p className={styles.drop__fileGuide}>
              <span className={styles.drop__link}>Загрузите файлы</span> с устройства
            </p>
          ) : (
            <>
              <p className={styles.drop__fileGuide}>Перетащите файл сюда</p>
              <span>
                или <span className={styles.drop__link}>загрузите</span> с устройства
              </span>
            </>
          )}
        </div>

        <input
          type="file"
          ref={activeInputRef}
          hidden
          onChange={handleInputChange}
          accept={accept}
        />
      </div>
    </motion.div>
  );
};
