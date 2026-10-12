import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import logo from 'assets/logo.webp';
import { PrivacyPolicyLink } from 'shared/ui';

import { LoginForm } from '../../auth-by-username';
import { RegisterForm } from '../../auth-register';
import { AuthResetPasswordBtn } from '../../auth-reset-password-btn';
import { AuthSocial } from '../../auth-social';
import { AuthSwitcher } from '../../auth-switcher';
import { AuthMode } from '../model/types';

import styles from './AuthCard.module.scss';

const AuthCard = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className={styles.card}>
      <div className={styles.card__header}>
        <h1 className={styles.card__title}>
          <img className={styles.card__logo} src={logo} alt="Logo TodoList" />
        </h1>
        <AuthSwitcher mode={mode} onChange={setMode} />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'register' && (
          <motion.div
            key="register"
            initial={{ x: 30, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <RegisterForm />
          </motion.div>
        )}

        {mode === 'login' && (
          <motion.div
            key="login"
            className={styles.card__motion}
            initial={{ x: -30, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <LoginForm />

            <div className={styles.card__divider}>или</div>

            <AuthSocial />

            <div className={styles.card__footer}>
              <AuthResetPasswordBtn />
              <PrivacyPolicyLink />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthCard;
