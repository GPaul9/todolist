import styles from './PrivacyPolicyLink.module.scss';

export const PrivacyPolicyLink = () => (
  <a className={styles['policy-link']} href="/files/PrivacyPolicy.pdf" download="TODOLIST Политика конфиденциальности.pdf">
    Политика конфиденциальности
  </a>
);
