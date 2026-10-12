import clsx from 'clsx';

import ControlIconL from 'assets/date-picker-control-icon.svg?react';

import styles from './MonthControlBtn.module.scss';

type TMonthControlBtn = {
  position: 'left' | 'right';
};

export const MonthControlBtn = ({ position, ...props }: TMonthControlBtn) => (
  <button {...props} className={styles['control-btn']}>
    <ControlIconL
      className={clsx(
        styles['control-btn__icon'],
        position === 'right' && styles['control-btn__icon_right'],
      )}
    />
  </button>
);
