import { useDraggable } from '@dnd-kit/react';
import { clsx } from 'clsx';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import PaperclipIcon from 'assets/attachment-icon.svg?react';
import CalenderIcon from 'assets/calender-icon.svg?react';
import DeadlineIcon from 'assets/deadline-icon.svg?react';
import BellIcon from 'assets/notification-icon.svg?react';
import { PriorityList, StatusList, Task, useTaskActions } from 'entities/task';
import { formatDateNumber } from 'shared/lib/formatDate';
import { Button, TagBadge } from 'shared/ui';

import styles from './TaskCard.module.scss';

interface TProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const VISIBLE_TAGS = 3;

export const TaskCard = ({ task, onEdit }: TProps) => {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.md });
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const { actions, isPending } = useTaskActions();

  const visibleTags = task.tags.slice(0, VISIBLE_TAGS);
  const hiddenTags = Math.max(0, task.tags.length - VISIBLE_TAGS);

  const isReadOnly = task.status === 'done' || !!task.archived_at;
  const isStatusDisabled = !!task.archived_at;

  // dragNdrop
  const { ref, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
      fromListId: task.task_list_id,
    },
  });
  // ------------------

  const hasDeadline = Boolean(task.deadline);
  const currentProgress = task.progress ?? 0;

  const getProgressStatus = () => {
    const isOver = task.deadline ? new Date(task.deadline).getTime() < Date.now() : false;
    const isDone = currentProgress === 100;

    if (isOver && !isDone) return 'over';
    if (isDone) return 'done';
    if (currentProgress === 0) return 'todo';
    return 'in-progress';
  };

  const progressStatus = getProgressStatus();

  if (isMobile && isDragging) {
    return (
      <div className={styles['card-drag']}>
        <span className={styles['card-drag__title']}>{task.title}</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={clsx(styles.card, isDragging && styles.card_drag)}
      data-task-status={task.status}
      data-status={progressStatus}
      onClick={() => isMobile && onEdit(task)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <StatusList
          className={styles.card__status}
          currentStatus={task.status}
          onChange={(newStatus) => actions.update({ taskId: task.id, data: { status: newStatus } })}
          disabled={isStatusDisabled}
        />
      </div>

      <div className={styles.card__meta}>
        <h2 className={styles.card__title}>{task.title}</h2>

        <span className={styles.card__id}>ID: {task.id}</span>

        <div onClick={(e) => e.stopPropagation()}>
          <PriorityList
            className={clsx(styles.card__priority)}
            currentPriority={task.priority}
            onChange={(newPriority) =>
              actions.update({ taskId: task.id, data: { priority: newPriority } })
            }
            disabled={isReadOnly}
          />
        </div>

        {isMobile ? (
          <div className={styles.card__infoLine}>
            {hasDeadline && (
              <div className={styles.card__deadline}>
                <DeadlineIcon />
                <span>до {formatDateNumber(task.deadline)}</span>
              </div>
            )}

            <div className={styles.card__icons}>
              <div
                className={clsx(styles.card__counter, task.total_attachments > 0 && styles.active)}
              >
                <PaperclipIcon /> {task.total_attachments}
              </div>
              <div
                className={clsx(styles.card__counter, task.total_reminders > 0 && styles.active)}
              >
                <BellIcon /> {task.total_reminders}
              </div>
            </div>
          </div>
        ) : isTablet ? (
          <div className={styles.card__infoLine}>
            <div className={styles.card__subtasks} data-status={progressStatus}>
              <CalenderIcon />
              <span>
                Подзадачи {task.completed_subtasks}/{task.total_subtasks}
              </span>
            </div>
            {hasDeadline && (
              <div className={styles.card__deadline}>
                <DeadlineIcon />
                <span>до {formatDateNumber(task.deadline)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.card__subtasks} data-status={progressStatus}>
            <CalenderIcon />
            <span>
              Подзадачи {task.completed_subtasks}/{task.total_subtasks}
            </span>
          </div>
        )}

        <div className={styles.card__divider}>
          <div
            className={styles.card__progress}
            data-status={progressStatus}
            style={{
              width: `${progressStatus === 'over' ? 100 : currentProgress === 0 ? 100 : currentProgress}%`,
            }}
          />
        </div>
      </div>

      {isTablet && !isMobile ? (
        <div className={styles.card__footer}>
          <div className={styles.card__tags}>
            {task.tags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
          <div className={styles.card__icons}>
            <div
              className={clsx(styles.card__counter, task.total_attachments > 0 && styles.active)}
            >
              <PaperclipIcon /> {task.total_attachments}
            </div>
            <div className={clsx(styles.card__counter, task.total_reminders > 0 && styles.active)}>
              <BellIcon /> {task.total_reminders}
            </div>
          </div>
        </div>
      ) : isMobile ? (
        <div className={styles.card__tags}>
          <div className={styles.card__group}>
            {visibleTags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
          {hiddenTags > 0 && (
            <span className={styles.card__more} aria-label={`еще ${hiddenTags} тегов`}>
              +{hiddenTags}
            </span>
          )}
        </div>
      ) : (
        <>
          <div className={styles.card__info}>
            {hasDeadline && (
              <div className={styles.card__deadline}>
                <DeadlineIcon />
                <span>до {formatDateNumber(task.deadline)}</span>
              </div>
            )}
            <div className={styles.card__icons}>
              <div
                className={clsx(styles.card__counter, task.total_attachments > 0 && styles.active)}
              >
                <PaperclipIcon /> {task.total_attachments}
              </div>
              <div
                className={clsx(styles.card__counter, task.total_reminders > 0 && styles.active)}
              >
                <BellIcon /> {task.total_reminders}
              </div>
            </div>
          </div>

          <div className={styles.card__tags}>
            {task.tags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        </>
      )}

      <div className={styles.card__btns}>
        {isReadOnly ? (
          <Button
            className={styles.card__openBtn}
            kind="secondary"
            onClick={(e) => {
              onEdit(task);
              e.stopPropagation();
            }}
          >
            Открыть
          </Button>
        ) : (
          <>
            <Button
              className={styles.card__editBtn}
              kind="secondary"
              onClick={(e) => {
                onEdit(task);
                e.stopPropagation();
              }}
            >
              Редактировать
            </Button>
            <Button
              className={styles.card__completeBtn}
              data-status={progressStatus}
              kind="primary"
              onClick={(e) => {
                actions.update({ taskId: task.id, data: { status: 'done' } });
                e.stopPropagation();
              }}
              disabled={isPending.update}
            >
              {isTablet ? 'Завершить' : 'Завершить задачу'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
