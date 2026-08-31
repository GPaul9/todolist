import { useState } from 'react';

import { useGetTags } from 'entities/tag';
import { Button } from 'shared/ui';

import { CreateTagModal } from './CreateTagModal';
import styles from './ProfileTags.module.scss';
import { TagsTable } from './TagsTable';

export const ProfileTags = () => {
  const { data: tags = [] } = useGetTags();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.tags}>
        <h1 className={styles.tags__title}>Теги</h1>
        <div className={styles.tags__wrapper}>
          {tags.length > 0 ? <TagsTable items={tags} /> : <p>Создать тег</p>}
          <Button
            kind="secondary"
            className={styles.tags__btn}
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            Создать новый тег
          </Button>
        </div>
      </div>

      <CreateTagModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
