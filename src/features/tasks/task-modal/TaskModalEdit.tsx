import CrossIcon from 'assets/cross-icon.svg?react';
import { Task } from 'entities/task';
import { Button, Modal } from 'shared/ui';

import { TaskModalDatesDesktop } from './task-dates/ui/TaskModalDatesDesktop';
import { TaskModalFiles } from './task-attachments/ui/TaskModalFiles';
import { TaskModalSubtasksDesktop } from './task-subtask/ui/TaskModalSubtasksDesktop';
import { TaskModalTagsDesktop } from './task-tags/ui/TaskModalTagsDesktop';
import { TaskModalTopDesktop } from './task-top/ui/TaskModalTopDesktop';
import { TaskModalDatesMobile } from './task-dates/ui/TaskModalDatesMobile';
import { TaskModalFilesMobile } from './task-attachments/ui/TaskModalFilesMobile';
import { TaskModalSubtasksMobile } from './task-subtask/ui/TaskModalSubtasksMobile';
import { TaskModalTagsMobile } from './task-tags/ui/TaskModalTagsMobile';
import { TaskModalTopMobile } from './task-top/ui/TaskModalTopMobile';
import { useTaskModalEdit } from './model/useTaskModalEdit';
import styles from './TaskModalEdit.module.scss';
import { modal, modalMobile } from 'shared/lib';

interface TProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const TaskModalEdit = ({ isOpen, onClose, task: initialTask }: TProps) => {
  const {
    task,
    userData,
    avatarUrl,
    isTablet,
    isMobile,
    isAllSubtasksDone,
    isTaskActive,
    isReadOnly,
    isStatusDisabled,
    isPendingUpdate,
    taskActions,
    handleUpdate,
    handleDelete,
    handleCompleteTask,
  } = useTaskModalEdit({ task: initialTask, onClose });

  if (!task) return null;

  return (
    <Modal
      className={styles.modal}
      isOpen={isOpen}
      onClose={onClose}
      modeX="right"
      modeY={isTablet ? 'bottom' : 'center'}
      variants={isTablet ? modalMobile : modal}
    >
      <button className={styles.modal__close} onClick={onClose} aria-label="Закрыть модальное окно">
        <CrossIcon width={24} height={24} />
      </button>

      {isTablet ? (
        <>
          <TaskModalTopMobile
            task={task}
            avatarUrl={avatarUrl}
            handleUpdate={handleUpdate}
            disabled={isReadOnly}
            statusDisabled={isStatusDisabled}
          />

          <TaskModalSubtasksMobile task={task} disabled={isReadOnly} />
          <TaskModalDatesMobile task={task} disabled={isReadOnly} />
          <TaskModalTagsMobile task={task} taskActions={taskActions} disabled={isReadOnly} />
          <TaskModalFilesMobile task={task} disabled={isReadOnly} />

          <div className={styles.modal__footer}>
            <Button className={styles.modal__deleteMobile} onClick={handleDelete} kind="secondary">
              {isMobile ? 'Удалить' : 'Удалить задачу'}
            </Button>

            {!isReadOnly && isAllSubtasksDone && isTaskActive && (
              <Button
                className={styles.modal__completeBtn}
                onClick={handleCompleteTask}
                kind="primary"
                disabled={isPendingUpdate}
                data-style="success"
              >
                Завершить задачу
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <TaskModalTopDesktop
            task={task}
            userData={userData}
            avatarUrl={avatarUrl}
            handleUpdate={handleUpdate}
            disabled={isReadOnly}
            statusDisabled={isStatusDisabled}
          />
          <TaskModalDatesDesktop
            task={task}
            handleUpdate={handleUpdate}
            disabled={isReadOnly}
            isUpdating={isPendingUpdate}
          />
          <TaskModalTagsDesktop task={task} taskActions={taskActions} disabled={isReadOnly} />
          <TaskModalSubtasksDesktop task={task} disabled={isReadOnly} />
          <TaskModalFiles task={task} disabled={isReadOnly} />

          <Button className={styles.modal__delete} onClick={handleDelete} kind="secondary">
            Удалить задачу
          </Button>
        </>
      )}
    </Modal>
  );
};
