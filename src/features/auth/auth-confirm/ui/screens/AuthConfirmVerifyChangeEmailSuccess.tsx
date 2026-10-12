import { useNavigate } from 'react-router-dom';

import SuccessIcon from 'assets/success-icon.svg?react';
import { Button } from 'shared/ui';

import styles from './AuthConfirmVerify.module.scss';

export const AuthConfirmVerifyChangeEmailSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <SuccessIcon className={styles.card__icon} />

      <h2 className={styles.card__title}>Электронная почта успешно изменена</h2>

      <p className={styles.card__descr}>
        Ваш новый адрес электронной почты подтверждён и сохранён в аккаунте.
      </p>

      <Button onClick={() => navigate('/project')}>Продолжить</Button>
    </div>
  );
};
