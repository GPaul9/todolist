import { useNavigate } from 'react-router-dom';

import { Button } from 'shared/ui';

import styles from './AuthResetSentEmail.module.scss';

const AuthResetSentEmail = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <h2 className={styles.card__title}>Отправили ссылку для восстановления пароля</h2>

      <p className={styles.card__descr}>Проверьте вашу почту и папку "Спам"</p>

      <Button kind="primary" onClick={() => navigate('/auth')}>
        Вернуться назад
      </Button>
    </div>
  );
};

export default AuthResetSentEmail;
