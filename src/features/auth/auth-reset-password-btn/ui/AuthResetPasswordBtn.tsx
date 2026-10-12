import { useNavigate } from 'react-router-dom';

import styles from './AuthResetPasswordBtn.module.scss';

export const AuthResetPasswordBtn = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.reset}>
      <span className={styles.reset__text}>Забыли пароль?</span>
      <button className={styles.reset__link} type="button" onClick={() => navigate('reset')}>
        Нажмите, чтобы сбросить
      </button>
    </div>
  );
};
