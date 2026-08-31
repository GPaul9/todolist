import styles from './ButtonLoader.module.scss';

export const ButtonLoader = () => {
  return (
    <div className={styles.loader}>
      <span className={styles.loader__dot}></span>
      <span className={styles.loader__dot}></span>
      <span className={styles.loader__dot}></span>
    </div>
  );
};
