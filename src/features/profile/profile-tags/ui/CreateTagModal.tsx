import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import CrossIcon from 'assets/cross-icon.svg?react';
import EditIcon from 'assets/edit-modal.svg?react';
import PaletteIcon from 'assets/palette-modal.svg?react';
import { createSchema, CreateTag, useCreateTag } from 'entities/tag';
import { COLORS } from 'shared/config/colors';
import { Button, Modal, Input, TagBadge } from 'shared/ui';

import styles from './TagModal.module.scss';
import { modal, modalMobile } from 'shared/lib';

interface TProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTagModal = ({ isOpen, onClose }: TProps) => {
  const { mutateAsync: createTag, isPending } = useCreateTag();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isValid },
  } = useForm<CreateTag>({
    resolver: zodResolver(createSchema),
    mode: 'onChange',
    defaultValues: { name: '', color: COLORS[0] },
  });

  const isTablet = useMediaQuery({ maxWidth: breakpoints.md });
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  const name = useWatch({ control, name: 'name' });
  const color = useWatch({ control, name: 'color' });

  useEffect(() => {
    if (isOpen) {
      reset({ name: '', color: COLORS[0] });
    }
  }, [isOpen, reset]);

  const handleError = (err: any) => {
    if (err.response?.data?.detail.includes('already exists')) {
      setError('name', { message: 'Тег с таким названием уже существует' });
    } else {
      setError('name', { message: 'Ошибка при сохранении' });
    }
  };

  const handleAddMore = async (data: CreateTag) => {
    if (isPending) return;

    try {
      await createTag(data);
      reset({ name: '', color: COLORS[0] });
    } catch (err: any) {
      handleError(err);
    }
  };

  const onSubmit = async (data: CreateTag) => {
    try {
      await createTag(data);
      onClose();
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <Modal
      className={styles.modal}
      isOpen={isOpen}
      onClose={onClose}
      modeX="right"
      modeY={isTablet ? 'bottom' : 'center'}
      variants={isTablet ? modalMobile : modal}
    >
      <div className={styles.modal__top}>
        {isMobile && (
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label="Закрыть модальное окно"
          >
            <CrossIcon width={24} height={24} />
          </button>
        )}
        <div className={styles.modal__grid}>
          <div className={styles.modal__item}>
            <div className={styles.modal__title}>
              {!isTablet && <EditIcon />} <span>Создать тег</span>
            </div>
            <div className={styles.modal__input}>
              <Controller
                name="name"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Название тега"
                    maxLength={30}
                    errorMessage={errors.name?.message}
                    status={errors.name ? 'error' : 'default'}
                    disabled={isPending}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              <span className={styles.modal__hint}>от 1 до 30 символов</span>
            </div>
          </div>

          <div className={styles.modal__item}>
            <div className={styles.modal__title}>
              {!isTablet && <PaletteIcon />} <span>Цвет</span>
            </div>

            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className={styles.modal__colors}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={clsx(styles.modal__circle, color === c && styles.active)}
                      style={{ backgroundColor: c }}
                      onClick={() => field.onChange(c)}
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        <div className={styles.modal__item}>
          <p className={styles.modal__title}>Готовый тег</p>
          <TagBadge name={name} color={color} />
          {!isMobile && (
            <Button
              type="button"
              className={styles.modal__addMoreBtn}
              onClick={handleSubmit(handleAddMore)}
              kind="secondary"
              isLoading={isPending}
              disabled={isPending}
            >
              Добавить еще
            </Button>
          )}
        </div>
      </div>

      <div className={styles.modal__edit}>
        <Button type="button" onClick={onClose} kind="secondary">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          kind="primary"
          isLoading={isPending}
          disabled={!isValid || isPending}
        >
          Сохранить изменения
        </Button>
      </div>
    </Modal>
  );
};
