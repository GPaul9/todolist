import CreateIcon from 'assets/create-icon.svg?react';

import { useCreateProjectBtn } from '../model/useCreateProjectBtn';

import styles from './CreateProjectBtnCard.module.scss';

export const CreateProjectBtnCard = () => {
  const { handleCreate, isPending } = useCreateProjectBtn();

  return (
    <div className={styles.card}>
      <button className={styles.card__btn} onClick={handleCreate} disabled={isPending}>
        <span className={styles.card__title}>Создать первый проект</span>

        <CreateIcon className={styles.card__icon} />
      </button>

      <p className={styles.card__descr}>Создайте новый проект чтобы начать работу</p>
    </div>
  );
};
