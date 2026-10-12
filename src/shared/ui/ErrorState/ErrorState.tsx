import { Link } from 'react-router-dom';

import errorStateImg from 'assets/error-state.webp';

import { Button } from '../Button/Button';

import styles from './ErrorState.module.scss';

type TProps = {
  onRetry: () => void;
};

export const ErrorState = ({ onRetry }: TProps) => {
  return (
    <div className={styles.errorState}>
      <div className={styles.errorState__content}>
        <img className={styles.errorState__img} src={errorStateImg} alt="Потеря соединения" />
        <div className={styles.info}>
          <h2 className={styles.errorState__title}>Произошла ошибка</h2>
          <p className={styles.errorState__descr}>
            Попробуйте еще раз или проверьте интернет-соединение
          </p>
        </div>
        <div className={styles['errorState__btn-wrapper']}>
          <Button className={styles.errorState__btn} onClick={onRetry}>
            Повторить попытку
          </Button>
          <Link className={styles.errorState__link} to={'/project'}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
};
