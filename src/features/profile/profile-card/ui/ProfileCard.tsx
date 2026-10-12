import { useRef } from 'react';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { useMe } from 'entities/user';
import { formatDate, useDialog } from 'shared/lib';
import { Button, notice, UserAvatar } from 'shared/ui';

import { useDeleteAvatar } from '../model/useDeleteAvatar';
import { useUploadAvatar } from '../model/useUpdateAvatar';

import styles from './ProfileCard.module.scss';

export const ProfileCard = () => {
  const { data } = useMe();
  const imageInput = useRef<HTMLInputElement>(null);
  const { mutate: uploadAvatar, isPending: isLoading } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();
  const dialog = useDialog();

  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0];
    if (!image) return;

    if (!['image/jpeg', 'image/png'].includes(image.type)) {
      return notice.error('Неподдерживаемый формат файла');
    }
    if (image.size > 2 * 1024 * 1024) {
      return notice.error('Размер файла не должен превышать 2 МБ');
    }

    uploadAvatar(image);

    if (imageInput.current) imageInput.current.value = '';
  };

  const handleDelete = async () => {
    const ok = await dialog.confirm({
      title: 'Удаление аватара',
      description: 'Вы уверены, что хотите удалить фото профиля?',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
    });

    if (!ok) return;

    deleteAvatar();
  };

  return (
    <div className={styles.card}>
      <input
        type="file"
        ref={imageInput}
        onChange={handleUpload}
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
      />

      <div className={styles.card__left}>
        <UserAvatar src={data?.avatar_path} size={190} />
        {!isMobile && <span className={styles.card__id}>ID {data?.id}</span>}
      </div>

      <div className={styles.card__right}>
        <h1 className={styles.card__info}>
          <span className={styles.card__name}>{data?.first_name || ''}</span>
          <span className={styles.card__name}>{data?.last_name || ''}</span>
        </h1>
        {isMobile && <span className={styles.card__id}> ID {data?.id}</span>}
        <div className={styles.card__date}>
          <span>Дата создания</span>
          <span>{formatDate(data?.created_at)}</span>
        </div>

        <p className={styles.card__help}>
          Рекомендуется использоваться максимальный размер 2 МБ JPG или PNG
        </p>

        <div className={styles.card__btns}>
          <Button
            className={styles.card__btn}
            type="button"
            kind="primary"
            onClick={() => imageInput.current?.click()}
            isLoading={isLoading}
          >
            Изменить фото
          </Button>
          <Button
            className={styles.card__btn}
            type="button"
            kind="secondary"
            onClick={handleDelete}
            disabled={!data?.avatar_path || isDeleting || isLoading}
            isLoading={isDeleting}
          >
            Удалить фото
          </Button>
        </div>
      </div>
    </div>
  );
};
