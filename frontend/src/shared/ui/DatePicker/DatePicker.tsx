import { JSX } from 'react';
import {
  DayPicker,
  DateRange,
  DayPickerProps,
  MonthCaptionProps,
  PreviousMonthButtonProps,
  NextMonthButtonProps,
} from 'react-day-picker';
import { ru } from 'react-day-picker/locale';

import { MonthCaption } from './components/MonthCaption';
import { MonthControlBtn } from './components/MonthControlBtn';
import styles from './DatePicker.module.scss';

type BaseProps = {
  disablePastDates?: boolean;
};

type SingleTProps = BaseProps & {
  mode: 'single';
  selected: Date | undefined;
  setSelected: (v: Date | undefined) => void;
};

type RangeTProps = BaseProps & {
  mode: 'range';
  selected: DateRange | undefined;
  setSelected: (v: DateRange | undefined) => void;
};

export function DatePicker(props: SingleTProps): JSX.Element;
export function DatePicker(props: RangeTProps): JSX.Element;
export function DatePicker(props: SingleTProps | RangeTProps) {
  const commonDayPickerProps: DayPickerProps = {
    locale: ru,
    navLayout: 'around',
    showOutsideDays: true,
    disabled: props.disablePastDates ? { before: new Date() } : undefined,
    classNames: {
      root: styles.picker__root,
      month: styles.picker__month,
      month_grid: styles.picker__grid,
      weekday: styles.picker__weekday,
      weekdays: styles.picker__weekdays,
      weeks: styles.picker__weeks,
      week: styles.picker__week,
      day: styles.picker__day,
      outside: styles['picker__outside-day'],
      day_button: styles['picker__day-btn'],
      selected: styles.picker__day_selected,
      range_start: styles['picker__day-start'],
      range_end: styles['picker__day-end'],
      range_middle: styles['picker__day-middle'],
    },
    components: {
      MonthCaption: (props: MonthCaptionProps) => <MonthCaption {...props} />,
      PreviousMonthButton: (props: PreviousMonthButtonProps) => (
        <MonthControlBtn {...props} position="left" />
      ),
      NextMonthButton: (props: NextMonthButtonProps) => (
        <MonthControlBtn {...props} position="right" />
      ),
    },
  };

  switch (props.mode) {
    case 'single':
      return (
        <DayPicker
          {...commonDayPickerProps}
          mode={props.mode}
          defaultMonth={props.selected}
          selected={props.selected}
          onSelect={props.setSelected}
        />
      );
    case 'range':
      return (
        <DayPicker
          {...commonDayPickerProps}
          mode={props.mode}
          defaultMonth={props.selected?.to}
          selected={props.selected}
          onSelect={props.setSelected}
        />
      );
  }
}
