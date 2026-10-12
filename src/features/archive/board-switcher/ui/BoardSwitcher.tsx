import clsx from 'clsx';
import { motion } from 'framer-motion';

import styles from './BoardSwitcher.module.scss';

export type ArchiveMode = 'project' | 'column';

type TProps = {
  mode: ArchiveMode;
  onChange: (mode: ArchiveMode) => void;
};

export const BoardSwitcher = ({ mode, onChange }: TProps) => {
  return (
    <div className={styles.switcher}>
      <div className={styles.switcher__buttons}>
        <button
          className={clsx(styles.switcher__btn, mode === 'project' && styles.switcher__btn_active)}
          onClick={() => onChange('project')}
          aria-pressed={mode === 'project'}
        >
          Проекты
        </button>

        <button
          className={clsx(styles.switcher__btn, mode === 'column' && styles.switcher__btn_active)}
          onClick={() => onChange('column')}
          aria-pressed={mode === 'column'}
        >
          Задачи
        </button>

        <motion.div
          className={styles.switcher__border}
          layout
          transition={{ type: 'spring', stiffness: 350, damping: 24 }}
          style={{
            left: mode === 'project' ? 0 : '50%',
            width: '50%',
          }}
        />
      </div>
    </div>
  );
};
