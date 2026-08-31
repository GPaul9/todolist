import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { Link, Navigate, useLocation } from 'react-router-dom';

import ClockIcon from 'assets/clock-icon.svg?react';
import { useTimer } from 'shared/lib';
import { Button, Timer } from 'shared/ui';

import { resendRequest } from '../../api/confirm';

import styles from './AuthConfirmRequest.module.scss';

const AuthConfirmRequest = () => {
  const locationState = useLocation().state as { email?: string } | undefined;
  const email = locationState?.email;

  const STORAGE_KEY = `confirm_email_timer`;

  const { mutate: resendEmail, isPending } = useMutation({
    mutationFn: () => resendRequest(email!),
    onSuccess: () => {
      start(15);
    },
  });

  const { time, start, isRunning } = useTimer({
    storageKey: STORAGE_KEY,
  });

  if (!email) return <Navigate to="/auth" replace />;

  return (
    <div className={styles.card}>
      <h2 className={styles.card__title}>
        Подтвердите <br className={styles.card__title_break} /> свой адрес электронной&nbsp;почты
      </h2>
      <p className={clsx(styles.card__descr, isRunning && styles.card__descr_position)}>
        Письмо с подтверждением отправлено&nbsp;на <br className={styles.card__descr_break} />
        <strong className={styles.card__descr_email}>{email}</strong>
      </p>

      {isRunning && (
        <p className={styles.card__wrapper}>
          <ClockIcon className={styles.card__icon} aria-hidden="true" />
          <span>Отправить письмо повторно можно через</span>
          <Timer time={time} />
        </p>
      )}

      <Button
        className={styles.card__btn}
        kind="primary"
        onClick={() => resendEmail()}
        disabled={isRunning || isPending}
        isLoading={isPending}
      >
        Отправить письмо еще раз
      </Button>

      <Link to={'/auth'} className={styles.card__link}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default AuthConfirmRequest;
