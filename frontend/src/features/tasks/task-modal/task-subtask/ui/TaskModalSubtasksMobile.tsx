import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import PaperclipIcon from 'assets/attachment-icon.svg?react';
import CreateColumnIcon from 'assets/create-icon-light.svg?react';
import { Task } from 'entities/task';
import { tooltip } from 'shared/lib';
import { Tooltip, Input } from 'shared/ui';

import { TaskModalSubtasksDesktopSkeleton } from './TaskModalSubtasksDesktopSkeleton';

import { SubtaskFilesModal } from '../../task-attachments/ui/SubtaskFilesModal';
import { SubtaskSwipe } from './SubtaskSwipe';
import { useSubtaskMobile } from '../model/useSubtaskMobile';
import styles from './TaskModalSubtasksMobile.module.scss';

interface TProps {
  task: Task;
  disabled?: boolean;
}

export const TaskModalSubtasksMobile = ({ task, disabled = false }: TProps) => {
  const {
    subtasks,
    isLoading,
    isPending,
    editSubtask,
    editValue,
    setEditValue,
    deleteMode,
    setDeleteMode,
    errorMessage,
    setErrorMessage,
    handleAdd,
    handleEdit,
    handleToggle,
    handleInputKeyDown,
    handleTextClick,
    handleDelete,
  } = useSubtaskMobile({ task, disabled });

  if (isLoading) return <TaskModalSubtasksDesktopSkeleton />;

  return (
    <div className={styles.subtasks}>
      <div className={styles.subtasks__top}>
        {!disabled && (
          <button
            className={styles.subtasks__create}
            onClick={handleAdd}
            disabled={isPending.create}
          >
            <CreateColumnIcon />
          </button>
        )}

        <span>
          Подзадачи {task.completed_subtasks}/{task.total_subtasks}
        </span>
      </div>

      <div className={styles.subtasks__list}>
        {subtasks.map((sub) => (
          <SubtaskSwipe
            key={sub.id}
            onSwipeLeft={!disabled ? () => setDeleteMode(sub.id) : undefined}
            onSwipeRight={!disabled ? () => setDeleteMode(null) : undefined}
          >
            <div className={styles.subtasks__item}>
              <div className={styles.subtasks__left}>
                <input
                  type="checkbox"
                  checked={sub.status === 'done'}
                  className={styles.subtasks__checkbox}
                  onChange={() => handleToggle(sub.id)}
                  disabled={disabled}
                />

                {editSubtask === sub.id ? (
                  <Input
                    autoFocus
                    className={styles.subtasks__input}
                    classNameContainer={styles.subtasks__inputContainer}
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      setErrorMessage(undefined);
                    }}
                    onBlur={() => handleEdit(sub.id)}
                    onKeyDown={(e) => handleInputKeyDown(e, sub.id)}
                    errorMessage={errorMessage}
                    status={errorMessage ? 'error' : 'default'}
                  />
                ) : (
                  <span
                    className={clsx(styles.subtasks__name, sub.status === 'done' && styles.done)}
                    onClick={(e) => handleTextClick(e, sub.id, sub.title)}
                  >
                    {sub.title}
                  </span>
                )}
              </div>
              {!(disabled && !sub.attachments?.length) && (
                <div className={styles.subtasks__actions}>
                  <AnimatePresence mode="wait">
                    {deleteMode === sub.id ? (
                      <motion.button
                        key="delete"
                        variants={tooltip}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={styles.subtasks__delete}
                        onClick={() => handleDelete(sub.id)}
                      >
                        Удалить
                      </motion.button>
                    ) : (
                      <SubtaskFilesModal
                        key="attach"
                        task={task}
                        sub={sub}
                        disabled={disabled}
                        trigger={
                          <Tooltip content="Файл" zIndex={200}>
                            <PaperclipIcon />
                          </Tooltip>
                        }
                        className={clsx(
                          styles.subtasks__attach,
                          sub.attachments?.length > 0 && styles.active,
                        )}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </SubtaskSwipe>
        ))}
      </div>
    </div>
  );
};
