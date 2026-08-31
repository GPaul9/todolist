import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { usePasswordValidation } from 'features/auth/auth-register/lib/usePasswordValidation';
import { Button, Input, PasswordStrength } from 'shared/ui';

import { resetPasswordRequest } from '../../api/reset';
import { ResetPasswordFormData, resetPasswordSchema } from '../../model/types/reset';

import styles from './AuthResetVerifySuccess.module.scss';

interface TProps {
  token: string;
}

export const AuthResetVerifySuccess = ({ token }: TProps) => {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordValue = useWatch({ control, name: 'new_password' }) || '';
  const confirmPasswordValue = useWatch({ control, name: 'confirm_password' }) || '';
  const { strengthScore, isValid: isPasswordStrong } = usePasswordValidation(passwordValue);

  const { mutate: updatePassword, isPending } = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      resetPasswordRequest({
        token,
        password: data.new_password,
        repeat_password: data.confirm_password,
      }),
    onSuccess: () => {
      navigate('/auth', {
        state: {
          notice: {
            type: 'success',
            message: 'Пароль успешно изменен',
          },
        },
        replace: true,
      });
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail || '';
      let serverMessage = 'Произошла ошибка. Попробуйте еще раз.';

      if (detail.toLowerCase().includes('invaled') || detail.toLowerCase().includes('expired')) {
        serverMessage = 'Срок действия ссылки истек. Попробуйте снова';
      } else if (detail.toLowerCase().includes('user not found')) {
        serverMessage = 'Пользователь не найден.';
      }

      setError('root', { message: serverMessage });
    },
  });

  const currentPasswordStatus = (() => {
    if (passwordValue) {
      if (isPasswordStrong) return 'success';
      if (strengthScore >= 3) return 'warning';
      return 'error';
    }
    if (errors.new_password) return 'error';
    return 'default';
  })();

  return (
    <div className={styles.card}>
      <div className={styles.card__header}>
        <h2 className={styles.card__title}>Придумайте новый пароль</h2>

        <p className={styles.card__descr}>Пароль не должен повторять предыдущий</p>
      </div>

      <form className={styles.card__form} onSubmit={handleSubmit((data) => updatePassword(data))}>
        <div className={styles['card__input-wrapper']}>
          <Input
            className={styles.card__input}
            label="Новый пароль"
            placeholder="Новый пароль"
            {...register('new_password')}
            status={currentPasswordStatus}
            errorMessage={errors.new_password?.message}
            strengthSpace={
              passwordValue && (
                <div className={styles.register__strength}>
                  <PasswordStrength score={strengthScore} onlyBar />
                  <PasswordStrength score={strengthScore} onlyText />
                </div>
              )
            }
          />
          <Input
            className={styles.card__input}
            label="Повторить пароль"
            placeholder="Повторить проль"
            {...register('confirm_password')}
            status={
              errors.confirm_password && confirmPasswordValue
                ? 'error'
                : !errors.confirm_password &&
                    confirmPasswordValue &&
                    confirmPasswordValue === passwordValue
                  ? 'success'
                  : 'default'
            }
            errorMessage={confirmPasswordValue ? errors.confirm_password?.message : ''}
          />
        </div>

        {errors.root && <p className={styles.card__error}>{errors.root.message}</p>}

        <Button
          className={styles.card__btn}
          type="submit"
          disabled={!isValid}
          isLoading={isPending}
        >
          Изменить пароль
        </Button>
      </form>
    </div>
  );
};
