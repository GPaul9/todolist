import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useMe, useUpdateUser } from 'entities/user';
import { useDialog } from 'shared/lib';
import { Input, Button } from 'shared/ui';

import { ProfileEmailData, ProfileEmailSchema } from '../../model/types';

import styles from './../ProfileSettings.module.scss';

export const ProfileEmail = () => {
  const { data: user } = useMe();
  const { mutateAsync, isPending } = useUpdateUser();
  const dialog = useDialog();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { isDirty, isValid, errors },
  } = useForm<ProfileEmailData>({
    resolver: zodResolver(ProfileEmailSchema),
    mode: 'onChange',
    defaultValues: {
      email: user?.email,
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({ email: user.email }, { keepFieldsRef: true });
  }, [user, reset]);

  const onSubmit = async (data: ProfileEmailData) => {
    if (data.email === (user?.email || '')) return;

    try {
      await mutateAsync({
        email: data.email,
      });

      await dialog.alert({
        description: (
          <>
            Отправили письмо для подтверждения на <strong>{data.email}</strong>. Пожалуйста,
            перейдите по ссылке в письме.
          </>
        ),
        confirmText: 'Закрыть',
      });

      reset({ email: data.email }, { keepFieldsRef: true });
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('email', { message: 'Эта почта уже занята' });
      }
    }
  };

  const handleReset = () => {
    if (!user) return;
    setValue('email', user.email, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form className={styles.settings__wrapper} onSubmit={handleSubmit(onSubmit)}>
      <div className={clsx(styles.settings__inner, styles.settings__inner_full)}>
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          {...register('email')}
          errorMessage={errors.email?.message}
          status={errors.email ? 'error' : 'default'}
          disabled={isPending}
        />
      </div>

      <div className={styles.settings__btns}>
        <Button
          kind={isDirty ? 'primary' : 'secondary'}
          className={styles.settings__btn}
          type="submit"
          disabled={!isDirty || !isValid}
          isLoading={isPending}
        >
          Сохранить
        </Button>

        {isDirty && (
          <Button kind="secondary" type="button" onClick={handleReset} disabled={isPending}>
            Отменить
          </Button>
        )}
      </div>
    </form>
  );
};
