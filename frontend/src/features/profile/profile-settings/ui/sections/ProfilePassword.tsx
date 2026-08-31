import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useUpdateUser } from 'entities/user';
import { forbiddenChars, usePasswordValidation } from 'features/auth/auth-register/lib/usePasswordValidation';
import { Button, PasswordInput, PasswordStrength } from 'shared/ui';

import { UpdatePasswordData, UpdatePasswordSchema } from '../../model/types';

import styles from './../ProfileSettings.module.scss';

export const ProfilePassword = () => {
  const [isEdit, setIsEdit] = useState(false);
  const { mutateAsync: updateProfile, isPending } = useUpdateUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(UpdatePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      new_password: '',
      repeat_password: '',
    },
  });

  const oldPasswordValue = useWatch({ control, name: 'password' });
  const newPasswordValue = useWatch({ control, name: 'new_password' }) || '';
  const { strengthScore, isValid: isPasswordStrong } = usePasswordValidation(newPasswordValue);

  useEffect(() => {
    if (newPasswordValue) {
      trigger('new_password');
    }
  }, [oldPasswordValue, trigger, newPasswordValue]);

  const onSubmit = async (data: UpdatePasswordData) => {
    try {
      await updateProfile({
        password: data.password,
        new_password: data.new_password,
        repeat_password: data.new_password,
      });
      reset();
      setIsEdit(false);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('password', { message: 'Неверный текущий пароль' });
      }
    }
  };

  const handleClose = () => {
    reset();
    setIsEdit(false);
  };

  if (!isEdit) {
    return (
      <div className={styles.settings__wrapper}>
        <p className={styles.settings__text}>Сменить пароль</p>
        <Button kind="secondary" className={styles.settings__btn} onClick={() => setIsEdit(true)}>
          Изменить
        </Button>
      </div>
    );
  }

  const currentPasswordStatus = (() => {
    if (!newPasswordValue && errors.new_password) return 'error';

    const hasHardPasswordError = newPasswordValue.length > 100 || forbiddenChars.test(newPasswordValue);

    if(hasHardPasswordError) {
      return 'error';
    }

    if (isPasswordStrong) {
      return errors.new_password ? 'error' : 'success';
    }

    if (strengthScore >= 3) return 'warning';

    if (errors.new_password) return 'error';

    return 'default';
  })();

  const passwordClass = {
    success: styles.isSuccess,
    warning: styles.isMedium,
    error: styles.isError,
    default: '',
  }[currentPasswordStatus];

  return (
    <form className={styles.settings__wrapper} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.settings__inner}>
        <PasswordInput
          label="Старый пароль"
          {...register('password')}
          errorMessage={errors.password?.message}
          status={errors.password ? 'error' : 'default'}
        />

        <div className={`${styles.settings__password} ${passwordClass}`}>
          <PasswordInput
            label="Новый пароль"
            {...register('new_password')}
            errorMessage={errors.new_password?.message}
            status={currentPasswordStatus}
            strengthSpace={
              newPasswordValue && (
                <div className={styles.settings__strength}>
                  <PasswordStrength score={strengthScore} onlyBar />
                  <PasswordStrength score={strengthScore} onlyText />
                </div>
              )
            }
          />
          {!newPasswordValue && (
            <p className={styles.settings__symbols}>
              Пароль из 12 символов и должен содержать: (A–Z), (a–z), (0–9), специальный символ.
              Запрещены: ’ “ \ / ; – # &lt; &gt; &amp; @
            </p>
          )}
        </div>
      </div>

      <div className={styles.settings__btns}>
        <Button
          kind={isDirty && isValid && isPasswordStrong ? 'primary' : 'secondary'}
          type="submit"
          disabled={!isDirty || !isValid || !isPasswordStrong || isPending}
          isLoading={isPending}
        >
          Сохранить
        </Button>
        <Button kind="secondary" onClick={handleClose} disabled={isPending}>
          Отменить
        </Button>
      </div>
    </form>
  );
};
