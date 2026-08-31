import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { mergeParams } from '../../lib';
import { Input } from '../InputField/Input';

import styles from './SearchInput.module.scss';

type TProps = {
  value?: string | undefined;
  onChange?: (value: string) => void;
  paramKey?: string;
  className?: string;
};

export const SearchInput = ({ value, onChange, paramKey = 'search', className }: TProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValue = searchParams.get(paramKey) ?? '';

  const [searchValue, setSearchValue] = useState(urlValue);

  const isControlled = value !== undefined && onChange !== undefined;

  const currentValue = isControlled ? value : searchValue;

  const handleChange = (newValue: string) => {
    if (isControlled) return onChange(newValue);

    setSearchValue(newValue);

    const mergedParams = new URLSearchParams();
    if (newValue) {
      mergedParams.set(paramKey, newValue);
    }

    setSearchParams(mergeParams(mergedParams, searchParams, [paramKey]));
  };

  useEffect(() => {
    if (!isControlled) {
      setSearchValue(urlValue);
    }
  }, [urlValue, isControlled]);

  return (
    <Input
      type="text"
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Найти"
      maxLength={150}
      className={className}
      classNameContainer={styles.search}
    />
  );
};
