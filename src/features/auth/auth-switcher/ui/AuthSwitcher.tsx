import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { AuthMode } from 'features/auth/auth-card/model/types';

import styles from './AuthSwitcher.module.scss';

type TProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
};

export const AuthSwitcher = ({ mode, onChange }: TProps) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  return (
    <div className={styles.switcher}>
      <div className={styles.switcher__buttons}>
        <button
          className={clsx(styles.switcher__btn)}
          onClick={() => onChange('register')}
          aria-pressed={mode === 'register'}
        >
          {isMobile ? 'Регистрация' : 'Зарегистрироваться'}
        </button>

        <button
          className={clsx(styles.switcher__btn)}
          onClick={() => onChange('login')}
          aria-pressed={mode === 'login'}
        >
          Вход
        </button>

        <motion.div
          className={styles.switcher__border}
          layout
          transition={{ type: 'spring', stiffness: 350, damping: 24 }}
          style={{
            left: mode === 'register' ? 0 : '50%',
            width: '50%',
          }}
        />
      </div>
    </div>
  );
};
