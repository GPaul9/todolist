import clsx from 'clsx';
import { ComponentType, SVGProps } from 'react';

import SuccessIcon from 'assets/green-square.svg?react';
import ErrorIcon from 'assets/red-triangle.svg?react';

import { TNotice } from '../noticeTypes';

import styles from './Toast.module.scss';

type TProps = {
  type: Extract<TNotice, 'success' | 'error'>;
  message: string;
};
const icons: Record<TProps['type'], ComponentType<SVGProps<SVGSVGElement>>> = {
  success: SuccessIcon,
  error: ErrorIcon,
};

export const Toast = ({ type, message }: TProps) => {
  const Icon = icons[type];

  return (
    <div className={clsx(styles.toast, styles[`toast_${type}`])}>
      <Icon className={styles.toast__icon} />
      {message}
    </div>
  );
};
