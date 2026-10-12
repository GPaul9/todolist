import { useState } from 'react';

import DeleteIcon from 'assets/delete-icon.svg?react';
import EditIcon from 'assets/edit-icon.svg?react';
import { Tag, useDeleteTag } from 'entities/tag';
import { useDialog } from 'shared/lib';
import { TagBadge, Tooltip } from 'shared/ui';

import { EditTagModal } from './EditTagModal';
import styles from './TagsTable.module.scss';

interface TProps {
  items: Tag[];
}

export const TagsTable = ({ items }: TProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const dialog = useDialog();
  const { mutate: deleteTag } = useDeleteTag();

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleOpenDelete = async (tag: Tag) => {
    if (tag.task_count === 0) {
      deleteTag(tag.id);
      return;
    }

    const ok = await dialog.confirm({
      description: (
        <>
          Этот тег привязан к задаче. <br />
          Вы действительно хотите его удалить?
        </>
      ),
      confirmText: 'Удалить',
      cancelText: 'Отмена',
    });

    if (!ok) return;

    deleteTag(tag.id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  return (
    <>
      <div className={styles.table}>
        <div className={`${styles.table__row} ${styles.table__header}`}>
          <div>Название</div>
          <div>Цвет</div>
          <div>Количество задач</div>

          <div>Действия</div>
        </div>

        {items.map((tag) => (
          <div key={tag.id} className={styles.table__row}>
            <div className={styles.table__name}>
              <TagBadge name={tag.name} color={tag.color} />
            </div>
            <div>
              <div className={styles.table__color} style={{ backgroundColor: tag.color }} />
            </div>

            <div className={styles.table__tasks}>{tag.task_count}</div>

            <div className={styles.table__actions}>
              <div className={styles.table__inner}>
                <Tooltip content="Редактировать">
                  <button
                    className={styles.table__btn}
                    aria-label="Редактировать тег"
                    onClick={() => handleEdit(tag)}
                  >
                    <EditIcon />
                  </button>
                </Tooltip>

                <Tooltip content="Удалить" z-index={1000}>
                  <button
                    className={styles.table__btn}
                    aria-label="Удалить тег"
                    onClick={() => handleOpenDelete(tag)}
                  >
                    <DeleteIcon />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditTagModal isOpen={isModalOpen} initialTag={editingTag} onClose={closeModal} />
    </>
  );
};
