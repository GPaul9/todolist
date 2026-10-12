import { MonthCaptionProps } from 'react-day-picker';

import styles from './MonthCaption.module.scss';

export const MonthCaption = ({ calendarMonth }: MonthCaptionProps) => {
  const months = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ];
  return (
    <div className={styles.caption}>
      {months[calendarMonth.date.getMonth()]} {calendarMonth.date.getFullYear()}
    </div>
  );
};
