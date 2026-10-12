import { useEffect, useState } from 'react';

import { capitalize } from 'shared/lib';

import styles from './DateTimeWidget.module.scss';

export const DateTimeWidget = () => {
  const [dateNow, setDateNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(new Date());
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  const month = capitalize(dateNow.toLocaleString('ru-RU', { month: 'short' }).replace('.', ''));

  const day = dateNow.toLocaleString('ru-RU', { day: '2-digit' });
  const time = dateNow.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const weekday = capitalize(dateNow.toLocaleString('ru-RU', { weekday: 'long' }));
  const year = dateNow.getFullYear();

  return (
    <div className={styles.widget}>
      <span className={styles.widget__line}>
        {month} {day}, {time}{' '}
      </span>
      <span className={styles.widget__line}>
        {weekday}, {year}
      </span>
    </div>
  );
};
