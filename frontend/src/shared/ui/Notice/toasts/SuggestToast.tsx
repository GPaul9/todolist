import clsx from 'clsx';
import { ComponentType, SVGProps, useState } from 'react';
import { Id } from 'react-toastify';

import CheckIcon from 'assets/check-icon.svg?react';
import CupIcon from 'assets/cup-icon.svg?react';

import { Spinner } from '../../Loader/Spinner/Spinner';
import { TNotice } from '../noticeTypes';

import styles from './SuggestToast.module.scss';

export type SuggestProps = {
  title: string;
  message: string;
  onClick: (toastId: Id) => void;
};

type TProps = SuggestProps & {
  toastId: Id;
  type: Extract<TNotice, 'suggestComplete'>;
};

const icons: Record<TProps['type'], ComponentType<SVGProps<SVGSVGElement>>> = {
  suggestComplete: CupIcon,
};

export const SuggestToast = ({ type, title, message, toastId, onClick }: TProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = () => {
    onClick(toastId);
    setIsLoading(true);
  };

  const Icon = icons[type];

  return (
    <div className={clsx(styles.toast, styles[`toast_${type}`])}>
      <Icon className={clsx(styles.toast__icon, styles[`toast__icon_${type}`])} />
      <div className={styles.toast__content}>
        <h5 className={styles.toast__title}>
          <strong>{title}</strong>
        </h5>
        <p className={styles.toast__descr}>{message}</p>
      </div>
      {!isLoading && (
        <button className={styles.toast__btn} onClick={handleClick}>
          <CheckIcon className={styles['toast__btn-icon']} />
        </button>
      )}
      {isLoading && <Spinner size={30} />}
    </div>
  );
};
