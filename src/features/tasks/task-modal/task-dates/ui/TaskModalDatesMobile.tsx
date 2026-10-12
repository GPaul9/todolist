import { useState } from 'react';

import DeadlineIcon from 'assets/deadline-icon.svg?react';
import BellIcon from 'assets/notification-icon.svg?react';
import { useGetReminders } from 'entities/reminder';
import { Task } from 'entities/task';
import { formatDateNumber } from 'shared/lib';
import { Spinner } from 'shared/ui';

import { TaskDatesList } from './TaskDatesList';
import styles from './TaskModalDatesMobile.module.scss';

interface TProps {
  task: Task;
  disabled?: boolean;
}

export const TaskModalDatesMobile = ({ task, disabled = false }: TProps) => {
  const [activeMode, setActiveMode] = useState<'deadline' | 'reminder' | null>(null);
  const { data: reminders = [], isLoading } = useGetReminders(task.id);

  return (
    <div className={styles.dates}>
      <div className={styles.dates__item}>
        <button className={styles.dates__button} onClick={() => setActiveMode('deadline')}>
          <div className={styles.dates__left}>
            <span className={styles.dates__text}>Дедлайн</span>
            <DeadlineIcon />
          </div>
        </button>
        <div className={styles.dates__right}>
          <span className={styles.dates__value}>
            {task.deadline ? formatDateNumber(task.deadline) : ''}
          </span>
        </div>
      </div>

      <div className={styles.dates__item}>
        <button
          className={styles.dates__button}
          onClick={() => setActiveMode('reminder')}
          disabled={isLoading}
        >
          <div className={styles.dates__left}>
            <span className={styles.dates__text}>Напоминания</span>
            {isLoading ? <Spinner size={24} /> : <BellIcon />}
          </div>
        </button>
        <div className={styles.dates__right}>
          {reminders.map((reminder) => (
            <span key={reminder.id} className={styles.dates__value}>
              {formatDateNumber(reminder.reminder_at)}
            </span>
          ))}
        </div>
      </div>

      {activeMode && (
        <TaskDatesList
          task={task}
          mode={activeMode}
          isOpen={!!activeMode}
          onClose={() => setActiveMode(null)}
          disabled={disabled}
        />
      )}
    </div>
  );
};
