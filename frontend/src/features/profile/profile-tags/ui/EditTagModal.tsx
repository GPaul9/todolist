import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import CrossIcon from 'assets/cross-icon.svg?react';
import EditIcon from 'assets/edit-modal.svg?react';
import PaletteIcon from 'assets/palette-modal.svg?react';
import { Tag, EditTag, editSchema, useUpdateTag } from 'entities/tag';
import { COLORS } from 'shared/config/colors';
import { Button, Modal, Input, TagBadge } from 'shared/ui';

import styles from './TagModal.module.scss';

interface TProps {
  isOpen: boolean;
  onClose: () => void;
  initialTag: Tag | null;
}

export const EditTagModal = ({ isOpen, onClose, initialTag }: TProps) => {
  const { mutateAsync: updateTag, isPending } = useUpdateTag();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, isValid },
  } = useForm<EditTag>({
    resolver: zodResolver(editSchema),
    mode: 'onChange',
    defaultValues: initialTag || { name: '', color: COLORS[0] },
  });

  const isTablet = useMediaQuery({ maxWidth: breakpoints.md });

  const name = useWatch({ control, name: 'name' });
  const color = useWatch({ control, name: 'color' });

  useEffect(() => {
    if (isOpen && initialTag) {
      reset(initialTag);
    }
  }, [isOpen, initialTag, reset]);

  const onSubmit = async (data: EditTag) => {
    try {
      await updateTag(data);
      onClose();
    } catch (err: any) {
      if (err.response?.data?.detail.includes('already exists')) {
        setError('name', { message: 'Тег с таким названием уже существует' });
      } else {
        setError('name', { message: 'Ошибка при сохранении' });
      }
    }
  };

  return (
    <Modal
      className={styles.modal}
      isOpen={isOpen}
      onClose={onClose}
      modeX="right"
      modeY={isTablet ? 'bottom' : 'center'}
    >
      <div className={styles.modal__top}>
        {isTablet && (
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
              {!isTablet && <EditIcon />} <span>Редактировать тег</span>
            </div>
            <div className={styles.modal__input}>
              <Controller
                name="name"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    errorMessage={errors.name?.message}
                    status={errors.name ? 'error' : 'default'}
                    value={value || ''}
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
        </div>
      </div>

      <div className={styles.modal__edit}>
        <Button onClick={onClose} kind="secondary" disabled={isPending}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          isLoading={isPending}
          disabled={!isValid || isPending}
          kind="primary"
        >
          Сохранить изменения
        </Button>
      </div>
    </Modal>
  );
};
