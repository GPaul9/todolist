import promoImg from 'assets/auth-promo.webp';

import styles from './AuthPromoCard.module.scss';

export const AuthPromoCard = () => {
  return (
    <div className={styles.card}>
      <div className={styles.card__content}>
        <img
          src={promoImg}
          className={styles.card__img}
          alt="example Todolist app"
          rel="preload"
          fetchPriority="high"
        />
        <h2 className={styles.card__title}>Организуйте свое рабочее пространство</h2>
        <p className={styles.card__descr}>
          Создавайте и управляйте проектами и задачами в удобном таск-менеджере
        </p>
      </div>
    </div>
  );
};
