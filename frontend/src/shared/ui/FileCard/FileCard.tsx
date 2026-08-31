import { motion } from 'framer-motion';
import { formatFileSize } from 'shared/lib';
import CrossIcon from 'assets/cross-icon.svg?react';

import styles from './FileCard.module.scss';

interface TProps {
  id: string;
  name: string;
  size: number;
  disabled?: boolean;
  isDownloading?: boolean;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  animate?: boolean;
}

export const FileCard = ({
  id,
  name,
  size,
  disabled = false,
  isDownloading = false,
  onDownload,
  onDelete,
  animate = false,
}: TProps) => {
  const mainContent = () => (
    <>
      <button
        className={styles.files__fileDownloadBtn}
        disabled={isDownloading}
        onClick={() => onDownload?.(id)}
      >
        <span className={styles.files__fileName}>{name}</span>
      </button>

      <div className={styles.files__fileBottom}>
        <span className={styles.files__fileSize}>{formatFileSize(size)}</span>

        {!disabled && onDelete && (
          <button className={styles.files__fileDelete} onClick={() => onDelete?.(id)}>
            <CrossIcon />
          </button>
        )}
      </div>
    </>
  );

  if (animate) {
    return (
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={styles.files__fileCard}
      >
        {mainContent()}
      </motion.div>
    );
  }

  return <div className={styles.files__fileCard}>{mainContent()}</div>;
};
