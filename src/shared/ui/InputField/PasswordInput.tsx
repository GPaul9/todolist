import { useState, forwardRef } from 'react';

import EyeOffIcon from 'assets/eye-closed.svg?react';
import EyeIcon from 'assets/eye-open.svg?react';

import { Input, InputStatus } from './Input';
import styles from './PasswordInput.module.scss';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  status?: InputStatus;
  strengthSpace?: React.ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [passwordType, setPasswordType] = useState<'password' | 'text'>('password');
  const { status, errorMessage, strengthSpace, ...rest } = props;

  const TogglePasswordEye = () => {
    setPasswordType((prev) => (prev === 'password' ? 'text' : 'password'));
  };

  return (
    <Input
      className={styles.password__input}
      {...rest}
      status={status}
      errorMessage={errorMessage}
      ref={ref}
      type={passwordType}
      strengthSpace={strengthSpace}
      iconButton={
        <button
          className={styles.password__icon}
          onClick={TogglePasswordEye}
          type="button"
          tabIndex={-1}
          aria-label={passwordType === 'password' ? 'Показать пароль' : 'Скрыть пароль'}
        >
          {passwordType === 'password' ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
