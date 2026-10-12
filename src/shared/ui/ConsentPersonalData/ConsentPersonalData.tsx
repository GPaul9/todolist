import styles from './ConsentPersonalData.module.scss';

export const ConsentPersonalData = () => (
  <a className={styles['policy-link']} href="/files/ConsentPersonalData.pdf" download="Согласие на обработку персональных данных для пользователей таск-трекера «TODOLIST».pdf">
    Политика обработки персональных данных
  </a>
);
