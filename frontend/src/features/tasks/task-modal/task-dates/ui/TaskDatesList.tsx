import CrossIcon from 'assets/cross-icon.svg?react';
import DeleteIcon from 'assets/delete-icon.svg?react';
import EditIcon from 'assets/edit-icon.svg?react';
import { Task } from 'entities/task';
import { formatDateNumber, formatLocalTime } from 'shared/lib/formatDate';
import { Modal, Button, Tooltip } from 'shared/ui';
import { TaskModalPickerMobile } from './TaskModalPickerMobile';
import { TaskModalTimePicker } from './TaskModalTimePicker';
import { useDatesList } from '../model/useDatesList';
import styles from './TaskDatesList.module.scss';

interface TProps {
  task: Task;
  mode: 'deadline' | 'reminder';
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
}

export const TaskDatesList = ({ task, mode, isOpen, onClose, disabled = false }: TProps) => {
  const {
    step,
    setStep,
    selectedDate,
    setSelectedDate,
    reminders,
    isSaving,
    isReminderPending,
    handleHeaderClose,
    handleFinalSave,
    handleEditClick,
    handleDelete,
  } = useDatesList({ task, mode, disabled, onClose });

  return (
    <Modal className={styles.add} isOpen={isOpen} onClose={onClose}>
      <div className={styles.add__header}>
        <button className={styles.add__close} onClick={handleHeaderClose}>
          <CrossIcon />
        </button>
      </div>

      {step === 'list' && (
        <div className={styles.add__mode}>
          <h2 className={styles.add__title}>{mode === 'deadline' ? 'Дедлайн' : 'Напоминания'}</h2>
          {!disabled && !(mode === 'deadline' && !!task.deadline) && (
            <Button
              kind="primary"
              className={styles.add__btn}
              disabled={mode === 'deadline' && !!task.deadline}
              onClick={() => setStep('calendar')}
            >
              {mode === 'deadline' ? 'Создать дедлайн' : 'Создать напоминание'}
            </Button>
          )}

          <div className={styles.add__list}>
            {mode === 'deadline' &&
              (task.deadline ? (
                <div className={styles.add__card}>
                  <span>{formatDateNumber(task.deadline)}</span>
                  <span>{formatLocalTime(task.deadline)}</span>
                  {!disabled && (
                    <div className={styles.add__actions}>
                      <Tooltip content="Редактировать" zIndex={200}>
                        <button
                          className={styles.add__button}
                          aria-label="Редактировать дедлайн"
                          onClick={() => handleEditClick(task.deadline)}
                        >
                          <EditIcon />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              ) : (
                <span className={styles.add__empty}>У вас пока нет дедлайна</span>
              ))}

            {mode === 'reminder' &&
              (reminders.length > 0 ? (
                reminders.map((r) => (
                  <div key={r.id} className={styles.add__card}>
                    <span>{formatDateNumber(r.reminder_at)}</span>
                    <span>{formatLocalTime(r.reminder_at)}</span>
                    {!disabled && (
                      <div className={styles.add__actions}>
                        <Tooltip content="Редактировать" zIndex={200}>
                          <button
                            className={styles.add__button}
                            aria-label="Редактировать напоминание"
                            onClick={() => handleEditClick(r.reminder_at, r.id)}
                          >
                            <EditIcon />
                          </button>
                        </Tooltip>

                        <Tooltip content="Удалить" zIndex={200}>
                          <button
                            className={styles.add__button}
                            aria-label="Удалить напоминание"
                            onClick={() => handleDelete(r.id)}
                            disabled={isReminderPending.delete}
                          >
                            <DeleteIcon />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <span className={styles.add__empty}>У вас пока нет напоминаний</span>
              ))}
          </div>
        </div>
      )}

      {step === 'calendar' && (
        <TaskModalPickerMobile
          value={selectedDate}
          onNext={(date) => {
            setSelectedDate(date);
            setStep('time');
          }}
          disablePastDates={mode === 'reminder'}
        />
      )}

      {step === 'time' && (
        <TaskModalTimePicker
          isPending={isSaving}
          onBack={() => setStep('calendar')}
          onNoTime={() => handleFinalSave('09:00')}
          onSave={(timeStr) => handleFinalSave(timeStr)}
        />
      )}
    </Modal>
  );
};
