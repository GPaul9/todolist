import { useNavigate } from 'react-router-dom';

import FaildIcon from 'assets/faild-icon.svg?react';
import { Button } from 'shared/ui';

import styles from './AuthConfirmVerify.module.scss';

export const AuthConfirmVerifyChangeEmailFaild = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <FaildIcon className={styles.card__icon} />

      <h2 className={styles.card__title}>Срок действия ссылки истек</h2>

      <p className={styles.card__descr}>Вы можете повторить попытку в настройках профиля.</p>

      <Button onClick={() => navigate('/profile')}>Перейти в профиль</Button>
    </div>
  );
};
