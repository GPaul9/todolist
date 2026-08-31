import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { Button, DatePicker, DatePickerBtn, DatePickerModal, DatePickerPopover } from 'shared/ui';

import styles from './TaskDatePicker.module.scss';

type TProps = {
  selected: DateRange;
  setSelected: (value: DateRange | undefined) => void;
};

export const TaskDatePicker = ({ selected, setSelected }: TProps) => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const [draft, setDraft] = useState<DateRange | undefined>(selected);

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  const handleApply = () => {
    setSelected(draft);
  };

  const handleReset = () => {
    setDraft(undefined);
    setSelected(undefined);
  };

  if (!isTablet)
    return (
      <DatePickerPopover className={styles.picker} trigger={<DatePickerBtn value={selected} />}>
        {(handleClose) => (
          <>
            <DatePicker mode="range" selected={draft} setSelected={setDraft} />

            <div className={styles['picker__btn-wrapper']}>
              <Button kind="outline" className={styles.picker__btn} onClick={handleReset}>
                Сбросить
              </Button>
              <Button
                kind="primary"
                className={styles.picker__btn}
                onClick={() => {
                  handleApply();
                  handleClose();
                }}
              >
                Сохранить
              </Button>
            </div>
          </>
        )}
      </DatePickerPopover>
    );

  if (isTablet)
    return (
      <DatePickerModal className={styles.picker} trigger={<DatePickerBtn value={selected} />}>
        {(handleClose) => (
          <>
            <DatePicker mode="range" selected={draft} setSelected={setDraft} />

            <div className={styles['picker__btn-wrapper']}>
              <Button kind="outline" className={styles.picker__btn} onClick={handleReset}>
                Сбросить
              </Button>
              <Button
                kind="primary"
                className={styles.picker__btn}
                onClick={() => {
                  handleApply();
                  handleClose();
                }}
              >
                Сохранить
              </Button>
            </div>
          </>
        )}
      </DatePickerModal>
    );
};
