import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import EditIcon from 'assets/edit-modal.svg?react';
import { Task, TypeTaskActions } from 'entities/task';
import { accordion, overlay } from 'shared/lib';
import { TagBadge, Input } from 'shared/ui';
import { useTagsDesktop } from '../model/useTagsDesktop';
import styles from './TaskModalTags.module.scss';

interface TProps {
  task: Task;
  taskActions: TypeTaskActions;
  disabled?: boolean;
}

export const TaskModalTagsDesktop = ({ task, taskActions, disabled = false }: TProps) => {
  const {
    isFocused,
    setIsFocused,
    searchValue,
    setSearchValue,
    isColor,
    setIsColor,
    error,
    setError,
    containerRef,
    filteredTags,
    newTag,
    colorsList,
    handleAdd,
    handleCreateNew,
    handleKeyAction,
  } = useTagsDesktop({ task, taskActions, disabled });
  return (
    <div className={styles.tags} ref={containerRef}>
      <div className={styles.tags__top}>
        <div className={styles.tags__left}>
          <EditIcon />
          <span className={styles.tags__text}>Тег</span>
        </div>
        <div className={styles.tags__right}>
          {!disabled && !isFocused && (
            <button className={styles.tags__btn} onClick={() => setIsFocused(true)}>
              Добавить
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isFocused ? (
          <motion.div
            key="tags-editor"
            variants={accordion}
            initial="initial"
            animate="animate"
            exit="exit"
            className={styles.tags__filter}
          >
            <div className={styles.tags__input}>
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
                  setError(undefined);
                }}
                onKeyDown={handleKeyAction}
              />
              <AnimatePresence>
                {newTag && (
                  <motion.div
                    key="colors"
                    variants={overlay}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={styles.tags__colors}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {colorsList.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={clsx(styles.tags__circle, isColor === c && styles.active)}
                        style={{ backgroundColor: c }}
                        onClick={() => setIsColor(c)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div onMouseDown={(e) => e.preventDefault()}>
              {searchValue.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={styles.tags__available}
                >
                  {filteredTags.map((tag) => (
                    <TagBadge
                      key={tag.id}
                      name={tag.name}
                      color={tag.color}
                      onClick={() => handleAdd(tag.id)}
                    />
                  ))}

                  {newTag && (
                    <TagBadge name={searchValue} color={isColor} onClick={handleCreateNew} />
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tags-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout
            className={styles.tags__list}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
