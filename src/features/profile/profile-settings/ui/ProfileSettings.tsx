import styles from './ProfileSettings.module.scss';
import { ProfileEmail } from './sections/ProfileEmail';
import { ProfileNames } from './sections/ProfileNames';
import { ProfilePassword } from './sections/ProfilePassword';

export const ProfileSettings = () => {
  return (
    <div className={styles.settings}>
      <h1 className={styles.settings__title}>Настройки пользователя</h1>
      <ProfileNames />
      <ProfileEmail />
      <ProfilePassword />
    </div>
  );
};
