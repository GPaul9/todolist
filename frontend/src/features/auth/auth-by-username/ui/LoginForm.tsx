import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import ClockIcon from 'assets/clock-icon.svg?react';
import { useTimer } from 'shared/lib';
import { Button, Input, PasswordInput, Timer } from 'shared/ui';

import { LoginFormData, loginSchema } from '../model/types';
import { useLoginForm } from '../model/useLoginForm';

import styles from './LoginForm.module.scss';

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const { mutate: loginUser, isPending } = useLoginForm();

  const keyBlock = 'loginBlockUntil';

  const onSubmit = (data: LoginFormData) => {
    loginUser(data, {
      onError: (err: any) => {
        if (err.response?.status === 401) {
          const message = 'Неверный email или пароль';
          setError('email', { type: 'server', message });
          setError('password', { type: 'server', message });
        }
        if (err.response?.status === 400) {
          const lockedUntil = err.response.data.detail.locked_until;
          const secondsLeft = Math.max(
            0,
            Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000),
          );
          start(secondsLeft);
        }
      },
    });
  };

  const { time, isRunning, start } = useTimer({
    storageKey: keyBlock,
  });

  return (
    <form className={styles.login} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles['login__input-wrapper']}>
        <Input
          label="Email"
          type="email"
          placeholder="Адрес электронной почты"
          errorMessage={errors.email?.message}
          status={errors.email ? 'error' : 'default'}
          {...register('email')}
        />

        <PasswordInput
          label="Пароль"
          placeholder="Пароль"
          status={errors.password ? 'error' : 'default'}
          errorMessage={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Button
        className={styles.login__btn}
        type="submit"
        isLoading={isPending}
        disabled={isRunning}
      >
        Войти
      </Button>

      {isRunning && (
        <div className={styles.login__block}>
          <h3 className={styles['login__block-title']}>Слишком много попыток входа</h3>
          <p className={styles['login__block-descr']}>Повторите попытку через:</p>
          <div className={styles['login__block-time']}>
            <ClockIcon className={styles['login__block-icon']} />
            <Timer time={time} className={styles['login__block-timer']} />
          </div>
        </div>
      )}
    </form>
  );
};
