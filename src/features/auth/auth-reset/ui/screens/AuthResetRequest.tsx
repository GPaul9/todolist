import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';

import { Button, Input, Timer } from 'shared/ui';
import ClockIcon from 'assets/clock-icon.svg?react';

import { forgotPasswordRequest } from '../../api/reset';
import { resetRequestSchema, ResetRequestFormData } from '../../model/types/reset';

import styles from './AuthResetRequest.module.scss';
import { useTimer } from 'shared/lib';

const AuthResetRequest = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<ResetRequestFormData>({
    resolver: zodResolver(resetRequestSchema),
    mode: 'onChange',
  });

  const { mutate: sendResetLink, isPending } = useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: (_, variables) => {
      navigate('sent', { state: { email: variables }, replace: true });
    },
    onError: (error: any) => {
      if (error.response?.status === 400) setError('email', { message: 'Пользователь не найден' });
      if (error.response?.status === 418) {
        const lockedUntil = error.response.data.detail.locked_until;
          const secondsLeft = Math.max(
            0,
            Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000),
          );
          start(secondsLeft);
      };
    },
  });

  const onSubmit = (data: ResetRequestFormData) => sendResetLink(data.email);

  const keyBlock = 'RequestChangePasswordUntil';
  const { time, isRunning, start } = useTimer({
    storageKey: keyBlock,
  });

  return (
    <div className={styles.card}>
      <div className={styles.card__header}>
        <h2 className={styles.card__title}>Восстановление пароля</h2>

        <p className={styles.card__descr}>
          Укажите вашу почту, на неё придёт ссылка для восстановления пароля
        </p>
      </div>

      <form className={styles.card__form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          className={styles.card__input}
          label="Почта"
          placeholder="email@mail.com"
          {...register('email')}
          status={errors.email ? 'error' : 'default'}
          errorMessage={errors.email?.message}
        />

        <Button type="submit" disabled={!isValid || isRunning} isLoading={isPending}>
          Получить ссылку
        </Button>

        {isRunning && (
        <div className={styles.card__block}>
            <h3 className={styles['card__block-title']}>Слишком много попыток сброса пароля</h3>
            <p className={styles['card__block-descr']}>Повторите попытку через:</p>
            <div className={styles['card__block-time']}>
              <ClockIcon className={styles['card__block-icon']} />
              <Timer time={time} className={styles['card__block-timer']} />
            </div>
          </div>
        )}
      </form>

      <Link className={styles.card__link} to={'/auth'}>
        Назад к регистрации
      </Link>
    </div>
  );
};

export default AuthResetRequest;
