import { PriorityList, StatusList, Task } from 'entities/task';
import { formatDateNumber } from 'shared/lib/formatDate';
import { TitleEdit, UserAvatar, DescriptionEdit } from 'shared/ui';

import styles from './TaskModalTopMobile.module.scss';

interface TProps {
  task: Task;
  avatarUrl?: string | null;
  handleUpdate: (fields: Partial<Task>) => void;
  disabled?: boolean;
  statusDisabled?: boolean;
}

export const TaskModalTopMobile = ({
  task,
  avatarUrl,
  handleUpdate,
  disabled = false,
  statusDisabled,
}: TProps) => {
  return (
    <>
      <div className={styles.modal}>
        <div className={styles.modal__top}>
          <TitleEdit
            value={task.title}
            onSave={(newTitle) => handleUpdate({ title: newTitle })}
            disabled={disabled}
          />

          <div className={styles.modal__date}>
            <UserAvatar src={avatarUrl} size={24} />
            <p className={styles.modal__date}>Создана: {formatDateNumber(task.created_at)}</p>
          </div>
        </div>

        <div className={styles.modal__statuses}>
          <div className={styles.modal__left}>
            <StatusList
              currentStatus={task.status}
              onChange={(newStatus) => handleUpdate({ status: newStatus })}
              disabled={statusDisabled}
            />
          </div>
          <div className={styles.modal__right}>
            <PriorityList
              currentPriority={task.priority}
              onChange={(newPriority) => handleUpdate({ priority: newPriority })}
              disabled={disabled}
            />
          </div>
        </div>

        <DescriptionEdit
          value={task.description || ''}
          onSave={(newDesc) => handleUpdate({ description: newDesc })}
          disabled={disabled}
        />
      </div>
    </>
  );
};
