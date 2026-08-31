import { useMe } from 'entities/user';
import { webpushApi } from 'entities/user/api/webpush.api';
import { notice } from 'shared/ui';

import { useSetNotifications } from '../model/useSetNotifications';

import styles from './ProfileNotifications.module.scss';

const PUBLIC_VAPID_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY;

export const ProfileNotifications = () => {
  const { data: user } = useMe();
  const { mutate: updateNotifications } = useSetNotifications();

  const getSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Браузер не поддерживает Push-уведомления');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Доступ к уведомлениям запрещен в браузере');
    }

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    const jsonSub = subscription.toJSON();

    return {
      endpoint: jsonSub.endpoint || '',
      keys: {
        p256dh: jsonSub.keys?.p256dh || '',
        auth: jsonSub.keys?.auth || '',
      },
    };
  };

  const handleToggle = async (key: 'webpush_notifications' | 'email_notifications') => {
    if (!user) return;

    const newValue = !user[key];

    if (key === 'webpush_notifications' && newValue) {
      try {
        const subscriptionPayload = await getSubscription();
        await webpushApi.register(subscriptionPayload);
      } catch (err: any) {
        notice.error(err.message || 'Не удалось настроить пуши');
        return;
      }
    }

    updateNotifications({
      [key]: newValue,
    });
  };

  return (
    <div className={styles.notification}>
      <h1 className={styles.notification__title}>Уведомления</h1>
      <div className={styles.notification__list}>
        <label className={styles.notification__item}>
          <input
            type="checkbox"
            className={styles.notification__checkbox}
              checked={!!user?.webpush_notifications}
              onChange={() => handleToggle('webpush_notifications')}
          />
          <span className={styles.notification__label}>Push-уведомления</span>
        </label>

        <label className={styles.notification__item}>
          <input
            type="checkbox"
            className={styles.notification__checkbox}
              checked={!!user?.email_notifications}
              onChange={() => handleToggle('email_notifications')}
          />
          <span className={styles.notification__label}>Уведомления на почту</span>
        </label>
      </div>
    </div>
  );
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
