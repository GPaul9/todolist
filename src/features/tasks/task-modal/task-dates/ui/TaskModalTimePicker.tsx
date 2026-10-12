import { Button } from 'shared/ui';
import { useTimePicker } from '../model/useTimePicker';
import styles from './TaskModalDatesMobile.module.scss';

interface TimePickerProps {
  onSave: (time: string) => void;
  onNoTime: () => void;
  onBack: () => void;
  isPending: boolean;
}

export const TaskModalTimePicker = ({ onSave, onNoTime, onBack, isPending }: TimePickerProps) => {
  const {
    hour,
    setHour,
    minute,
    setMinute,
    hoursList,
    minutesList,
    handleScroll,
  } = useTimePicker();

  return (
    <div className={styles.time}>
      <div className={styles.time__wheels}>
        <div className={styles.time__select} />

        <div className={styles.time__wheel} onScroll={(e) => handleScroll(e, hoursList, setHour)}>
          <div className={styles.time__space} />
          {hoursList.map((h) => (
            <div
              key={h}
              className={`${styles.time__item} ${hour === h ? styles.time__item_active : ''}`}
            >
              {parseInt(h, 10)}
            </div>
          ))}
          <div className={styles.time__space} />
        </div>

        <div className={styles.time__wheel} onScroll={(e) => handleScroll(e, minutesList, setMinute)}>
          <div className={styles.time__space} />
          {minutesList.map((m) => (
            <div
              key={m}
              className={`${styles.time__item} ${minute === m ? styles.time__item_active : ''}`}
            >
              {m}
            </div>
          ))}
          <div className={styles.time__space} />
        </div>
      </div>

      <div className={styles.time__actions}>
        <Button
          kind="secondary"
          className={styles.time__btn}
          onClick={onNoTime}
          disabled={isPending}
          isLoading={isPending}
        >
          Без времени
        </Button>
        <Button
          kind="primary"
          className={styles.time__btn}
          onClick={() => onSave(`${hour}:${minute}`)}
          disabled={isPending}
          isLoading={isPending}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};
