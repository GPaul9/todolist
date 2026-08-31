import { useNavigate } from 'react-router-dom';

import SuccessIcon from 'assets/success-icon.svg?react';
import { Button } from 'shared/ui';

import styles from './AuthConfirmVerify.module.scss';

export const AuthConfirmVerifySuccess = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <SuccessIcon className={styles.card__icon} />

      <h2 className={styles.card__title}>Регистрация прошла успешно</h2>

      <p className={styles.card__descr}>Теперь вы можете войти в аккаунт</p>

      <Button onClick={() => navigate('/auth')}>Войти</Button>
    </div>
  );
};
