import Skeleton from 'react-loading-skeleton';

import CrossIcon from 'assets/cross-icon.svg?react';
import DeadlineIcon from 'assets/deadline-icon.svg?react';
import BellIcon from 'assets/notification-icon.svg?react';
import { Task } from 'entities/task';
import { formatDateNumber, formatLocalTime } from 'shared/lib/formatDate';
import { Tooltip } from 'shared/ui';
import { useDatesDesktop } from '../model/useDatesDesktop';
import { TaskModalPickerDesktop } from './TaskModalPickerDesktop';
import styles from '../../TaskModalEdit.module.scss';

interface TProps {
  task: Task;
  handleUpdate: (fields: Partial<Task>) => void;
  disabled?: boolean;
  isUpdating?: boolean;
}

export const TaskModalDatesDesktop = ({
  task,
  handleUpdate,
  disabled = false,
  isUpdating = false,
}: TProps) => {
  const {
    reminders,
    isLoading,
    isPending,
    currentReminder,
    handleReminderSave,
    handleReminderDelete,
  } = useDatesDesktop({ task, disabled });

  const tooltipContent = (
    <div className={styles.modal__tooltipList}>
      {reminders.map((r) => (
        <div key={r.id} className={styles.modal__tooltipDate}>
          <div className={styles.modal__tooltipNumbers}>
            <span>{formatDateNumber(r.reminder_at)}</span>
            <span>{formatLocalTime(r.reminder_at)}</span>
          </div>
          {!disabled && (
            <button
              className={styles.modal__tooltipClose}
              onClick={(e) => handleReminderDelete(e, r.id)}
              disabled={isPending.delete}
              aria-label="Удалить напоминание"
            >
              <CrossIcon />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className={styles.modal__item}>
        <div className={styles.modal__left}>
          <DeadlineIcon />
          <span className={styles.modal__text}>Дедлайн</span>
        </div>
        <div className={styles.modal__right}>
          <span>{formatDateNumber(task.deadline)}</span>

          {!disabled && (
            <TaskModalPickerDesktop
              button={task.deadline ? 'Изменить' : 'Добавить'}
              value={task.deadline}
              onSave={(newDeadline) => handleUpdate({ deadline: newDeadline })}
              disabled={disabled || isUpdating}
            />
          )}
        </div>
      </div>

      <div className={styles.modal__item}>
        <div className={styles.modal__left}>
          <BellIcon />
          <span className={styles.modal__text}>Напоминание</span>
          {isLoading && <Skeleton width={24} height={24} circle />}
          {!!reminders.length && (
            <Tooltip content={tooltipContent} placement="right" zIndex={200} mode="primary">
              <div className={styles.modal__tooltipBadge}>{reminders.length}</div>
            </Tooltip>
          )}
        </div>
        <div className={styles.modal__right}>
          {isLoading && <Skeleton width={75} />}
          <span>
            {currentReminder?.reminder_at && formatDateNumber(currentReminder.reminder_at)}
          </span>

          {!disabled && (
            <TaskModalPickerDesktop
              button="Добавить"
              value=""
              disabled={isPending.create}
              onSave={handleReminderSave}
              disablePastDates={true}
            />
          )}
        </div>
      </div>
    </>
  );
};
