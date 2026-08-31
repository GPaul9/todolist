import { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import TextareaAutosize from 'react-textarea-autosize';

import { breakpoints } from 'app/styles/breakpoints';

import styles from './DescriptionEdit.module.scss';

type TProps = {
  value: string;
  onSave: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
};

export const DescriptionEdit = ({ value, onSave, maxLength = 2000, disabled = false }: TProps) => {
  const [text, setText] = useState(value);

  const isTablet = useMediaQuery({ maxWidth: breakpoints.md });

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleBlur = () => {
    if (disabled) return;
    if (text !== value) {
      onSave(text);
    }
  };

  return (
    <div className={styles.text}>
      <div className={styles.text__container}>
        <TextareaAutosize
          className={styles.text__field}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder={!isTablet ? 'Добавить описание' : '0/2000'}
          maxLength={maxLength}
          minRows={1}
          maxRows={isTablet ? 9 : 6}
          readOnly={disabled}
        />

        {!isTablet && (
          <span className={styles.text__count}>
            {text.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
