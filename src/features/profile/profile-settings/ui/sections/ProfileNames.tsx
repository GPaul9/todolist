import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useMe, useUpdateUser } from 'entities/user';
import { Input, Button } from 'shared/ui';

import { ProfileNamesData, ProfileNamesSchema } from '../../model/types';

import styles from './../ProfileSettings.module.scss';

export const ProfileNames = () => {
  const { data: user } = useMe();
  const { mutateAsync, isPending } = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, errors },
  } = useForm<ProfileNamesData>({
    resolver: zodResolver(ProfileNamesSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
    },
  });

  useEffect(() => {
    if (!user) return;

    reset(
      {
        first_name: user.first_name,
        last_name: user.last_name,
      },
      { keepFieldsRef: true },
    );
  }, [user, reset]);

  const onSubmit = async (data: ProfileNamesData) => {
    const updateUser = await mutateAsync({
      first_name: data.first_name,
      last_name: data.last_name,
    });

    reset(
      {
        first_name: updateUser.first_name,
        last_name: updateUser.last_name,
      },
      {
        keepFieldsRef: true,
      },
    );
  };

  return (
    <form className={styles.settings__wrapper} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.settings__inner}>
        <Input
          label="Фамилия"
          placeholder="Фамилия"
          {...register('last_name')}
          status={errors.last_name ? 'error' : 'default'}
          errorMessage={errors.last_name?.message}
        />
        <Input
          label="Имя"
          placeholder="Имя"
          {...register('first_name')}
          status={errors.first_name ? 'error' : 'default'}
          errorMessage={errors.first_name?.message}
        />
      </div>
      <Button
        kind={isDirty ? 'primary' : 'secondary'}
        className={styles.settings__btn}
        type="submit"
        disabled={!isDirty || !isValid}
        isLoading={isPending}
      >
        Сохранить
      </Button>
    </form>
  );
};
