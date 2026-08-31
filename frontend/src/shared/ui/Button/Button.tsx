import clsx from 'clsx';
import { FC, ButtonHTMLAttributes } from 'react';

import { ButtonLoader } from '../Loader/ButtonLoader/ButtonLoader';

import styles from './Buttons.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  kind?: 'primary' | 'secondary' | 'outline';
}

export const Button: FC<ButtonProps> = ({
  isLoading,
  disabled,
  children,
  className,
  kind = 'primary',
  type = 'button',
  ...props
}) => {
  return (
    <button
      className={clsx(styles.button, className, {
        [styles.button_loading]: isLoading,
      })}
      disabled={isLoading || disabled}
      type={type}
      data-kind={kind}
      {...props}
    >
      <span className={styles.button__content}>{children}</span>
      {isLoading && (
        <span className={styles.button__loader}>
          <ButtonLoader />
        </span>
      )}
    </button>
  );
};
