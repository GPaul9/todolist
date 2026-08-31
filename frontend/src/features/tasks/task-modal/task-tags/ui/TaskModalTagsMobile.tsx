import { useState } from 'react';

import EditIcon from 'assets/edit-modal.svg?react';
import { Task, TypeTaskActions } from 'entities/task';

import styles from './TaskModalTagsMobile.module.scss';
import { TaskTagsList } from './TaskTagsList';

interface TProps {
  task: Task;
  taskActions: TypeTaskActions;
  disabled?: boolean;
}

export const TaskModalTagsMobile = ({ task, taskActions, disabled = false }: TProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.tags}>
      <button className={styles.tags__button} onClick={() => setIsOpen(true)}>
        <span className={styles.tags__text} aria-label="Добавить теги">
          Теги
        </span>
        <EditIcon />
      </button>

      {isOpen && (
        <TaskTagsList
          task={task}
          taskActions={taskActions}
          onClose={() => setIsOpen(false)}
          isOpen={isOpen}
          disabled={disabled}
        />
      )}
    </div>
  );
};
