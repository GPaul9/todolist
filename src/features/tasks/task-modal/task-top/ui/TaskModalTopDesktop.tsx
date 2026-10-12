import OwnerIcon from 'assets/owner-icon.svg?react';
import PriorityIcon from 'assets/priority-icon.svg?react';
import StatusIcon from 'assets/status-icon.svg?react';
import { PriorityList, StatusList, Task } from 'entities/task';
import { formatDateNumber } from 'shared/lib';
import { TitleEdit, DescriptionEdit, UserAvatar } from 'shared/ui';

import styles from '../../TaskModalEdit.module.scss';

interface TProps {
  task: Task;
  userData: any;
  avatarUrl?: string | null;
  handleUpdate: (fields: Partial<Task>) => void;
  disabled?: boolean;
  statusDisabled?: boolean;
}

export const TaskModalTopDesktop = ({
  task,
  userData,
  avatarUrl,
  handleUpdate,
  disabled = false,
  statusDisabled,
}: TProps) => {
  return (
    <>
      <div className={styles.modal__top}>
        <TitleEdit
          value={task.title}
          onSave={(newTitle) => handleUpdate({ title: newTitle })}
          disabled={disabled}
        />

        <p className={styles.modal__date}>Дата создания: {formatDateNumber(task.created_at)}</p>
      </div>

      <DescriptionEdit
        value={task.description || ''}
        onSave={(newDesc) => handleUpdate({ description: newDesc })}
        disabled={disabled}
      />

      <div className={styles.modal__middle}>
        <div className={styles.modal__item}>
          <div className={styles.modal__left}>
            <OwnerIcon />
            <span className={styles.modal__text}>Владелец</span>
          </div>
          <div className={styles.modal__right}>
            <UserAvatar src={avatarUrl} size={24} />
            <span className={styles.modal__name}>{userData?.first_name}</span>
            <span className={styles.modal__name}>{userData?.last_name}</span>
          </div>
        </div>

        <div className={styles.modal__item}>
          <div className={styles.modal__left}>
            <StatusIcon />
            <span className={styles.modal__text}>Статус</span>
          </div>
          <div className={styles.modal__right}>
            <StatusList
              currentStatus={task.status}
              onChange={(newStatus) => handleUpdate({ status: newStatus })}
              disabled={statusDisabled}
            />
          </div>
        </div>

        <div className={styles.modal__item}>
          <div className={styles.modal__left}>
            <PriorityIcon />
            <span className={styles.modal__text}>Приоритет</span>
          </div>
          <div className={styles.modal__right}>
            <PriorityList
              currentPriority={task.priority}
              onChange={(newPriority) => handleUpdate({ priority: newPriority })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </>
  );
};
