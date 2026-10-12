import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { Input } from '../InputField/Input';

import styles from './TitleEdit.module.scss';

type TProps = {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export const TitleEdit = ({ value, onSave, className, disabled }: TProps) => {
  const [state, setState] = useState<'edit' | 'view'>('view');
  const [title, setTitle] = useState<string>(value);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(value);
  }, [value]);

  useEffect(() => {
    if (state === 'edit') {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [state]);

  const handleEdit = () => {
    if (disabled) return;

    setTitle(value);
    setErrorMessage(undefined);
    setState('edit');
  };

  const handleSave = () => {
    const trimmed = title.trim();

    if (!trimmed) {
      setErrorMessage('Поле не может быть пустым');
      return;
    }

    if (trimmed.length < 3) {
      setErrorMessage('Минимум 3 символа');
      return;
    }
    if (trimmed.length > 100) {
      setErrorMessage('Максимум 100 символов');
      return;
    }

    setErrorMessage(undefined);

    if (trimmed !== value) {
      onSave(trimmed);
    }

    setState('view');
  };

  const handleCancel = () => {
    setTitle(value);
    setErrorMessage(undefined);
    setState('view');
  };

  return (
    <>
      {state === 'view' && (
        <button onClick={handleEdit} className={styles.btn} disabled={disabled}>
          <h2
            className={clsx(styles.btn__title, disabled && styles.btn__title_disabled, className)}
          >
            {title}
          </h2>
        </button>
      )}
      {state === 'edit' && (
        <Input
          name="title"
          className={styles.input}
          classNameContainer={styles.input__container}
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          errorMessage={errorMessage}
        />
      )}
    </>
  );
};
