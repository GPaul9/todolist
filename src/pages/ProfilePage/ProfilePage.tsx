import { clsx } from 'clsx';

import { ProfileCard, ProfileSettings, ProfileTags, ProfileNotifications } from 'features/profile';
import { PageLayout } from 'widgets';

import styles from './ProfilePage.module.scss';

const ProfilePage = () => {
  return (
    <PageLayout
      title="Аккаунт"
      breadcrumbsItems={[
        { label: 'Мои проекты', href: '/project' },
        { label: 'Аккаунт', href: '/profile' },
      ]}
    >
      <div className={styles.profile}>
        <div className={clsx('container', styles.profile__content)}>
          <ProfileCard />
          <ProfileSettings />
          <ProfileTags />
          <ProfileNotifications />
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
