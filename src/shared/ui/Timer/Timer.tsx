import clsx from 'clsx';

import styles from './Timer.module.scss';

type TProps = {
  time: number | string;
  className?: string;
};

export const Timer = ({ time, className }: TProps) => {
  const totalSeconds = Number(time);

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');

  return (
    <span className={clsx(styles.timer, className)}>
      {totalSeconds >= 3600 ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`}
    </span>
  );
};
