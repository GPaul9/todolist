import { Button, DatePicker, DatePickerPopover } from 'shared/ui';
import { usePickerDesktop } from '../model/usePickerDesktop';
import styles from './TaskModalPicker.module.scss';

type TProps = {
  value: string | null;
  onSave: (newValue: string) => void;
  button: string;
  disabled?: boolean;
  disablePastDates?: boolean;
};

export const TaskModalPickerDesktop = ({
  value,
  onSave,
  button,
  disabled,
  disablePastDates = false,
}: TProps) => {
  const {
    date,
    setDate,
    time,
    setTime,
    isPastTime,
    handleApply,
    handleReset,
  } = usePickerDesktop({ value, disablePastDates, onSave });

  const trigger = (
    <div className={styles.time__deadline} role="button" tabIndex={0}>
      {button}
    </div>
  );

  return (
    <DatePickerPopover className={styles.time} trigger={trigger} placement="bottom-end">
      {(handleClose) => (
        <>
          <DatePicker
            mode="single"
            selected={date}
            setSelected={setDate}
            disablePastDates={disablePastDates}
          />

          <div className={styles.time__wrapper}>
            <label className={styles.time__text}>Время</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={styles.time__field}
            />
          </div>
          <div className={styles['time__btn-wrapper']}>
            <Button kind="outline" className={styles.picker__btn} onClick={handleReset}>
              Сбросить
            </Button>
            <Button
              kind="primary"
              onClick={() => {
                handleApply();
                handleClose();
              }}
              disabled={disabled || (isPastTime && disablePastDates)}
            >
              Сохранить
            </Button>
          </div>
        </>
      )}
    </DatePickerPopover>
  );
};
