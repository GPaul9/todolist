import { DateRange, isDateRange } from 'react-day-picker';

import DatePickerIcon from 'assets/date-picker-icon.svg?react';
import { formatDateNumber } from 'shared/lib/formatDate';

import styles from './DatePickerBtn.module.scss';

type TProps = {
  value: DateRange | Date | undefined;
};

export const DatePickerBtn = ({ value }: TProps) => {
  return (
    <div className={styles.btn}>
      <DatePickerIcon />

      <div className={styles.btn__value}>
        {isDateRange(value) ? (
          <>
            {value?.from ? formatDateNumber(value?.from) + ' ' : '__.__.____ '}
            &mdash;
            {value?.to ? ' ' + formatDateNumber(value?.to) : ' __.__.____'}
          </>
        ) : value ? (
          formatDateNumber(value)
        ) : (
          '__.__.____'
        )}
      </div>
    </div>
  );
};
