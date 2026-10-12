import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import CrossIcon from 'assets/cross-icon.svg?react';
import { Task, TypeTaskActions } from 'entities/task';
import { accordion } from 'shared/lib';
import { Modal, Button, TagBadge, Input } from 'shared/ui';
import { useTagsList } from '../model/useTagsList';
import styles from './TaskModalTagsMobile.module.scss';

interface TProps {
  task: Task;
  taskActions: TypeTaskActions;
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
}

export const TaskTagsList = ({ task, taskActions, isOpen, onClose, disabled = false }: TProps) => {
  const {
    searchValue,
    setSearchValue,
    isColor,
    setIsColor,
    error,
    setError,
    selectedTag,
    setSelectedTag,
    filteredTags,
    newTag,
    colorsList,
    handleAdd,
  } = useTagsList({ task, taskActions, disabled, onClose });
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.add}>
      <button className={styles.add__close} onClick={onClose}>
        <CrossIcon />
      </button>
      <h2 className={styles.add__title}>Теги</h2>

      <div className={styles.add__filter}>
        {!disabled && (
          <div className={styles.add__input}>
            <Input
              autoFocus
              className={styles.tags__field}
              placeholder="Введите название тега"
              value={searchValue}
              maxLength={30}
              errorMessage={error}
              status={error ? 'error' : 'default'}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setSelectedTag(null);
                setError(undefined);
              }}
            />
            <AnimatePresence>
              {newTag && (
                <motion.div
                  key="colors"
                  variants={accordion}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={styles.add__colors}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {colorsList.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={clsx(styles.add__circle, isColor === c && styles.active)}
                      style={{ backgroundColor: c }}
                      onClick={() => setIsColor(c)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div>
          <AnimatePresence mode="wait">
            {searchValue.trim().length > 0 ? (
              <motion.div
                key="search-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.add__available}
              >
                {filteredTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    name={tag.name}
                    color={tag.color}
                    isActive={selectedTag === tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                  />
                ))}

                {newTag && (
                  <TagBadge
                    name={searchValue}
                    color={isColor}
                    isActive={selectedTag === 'new'}
                    onClick={() => setSelectedTag('new')}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="tags-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.add__available}
              >
                {task.tags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    name={tag.name}
                    color={tag.color}
                    onRemove={
                      !disabled
                        ? () => taskActions.deleteTag({ taskId: task.id, tagId: tag.id })
                        : undefined
                    }
                  />
                ))}

                {task.tags.length === 0 && (
                  <span className={styles.add__empty}>
                    К задаче пока не добавлено ни одного тега
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!disabled && (
        <Button kind="primary" onClick={handleAdd}>
          Добавить
        </Button>
      )}
    </Modal>
  );
};
