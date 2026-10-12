import clsx from 'clsx';
import { ReactNode } from 'react';

import styles from './ColumnList.module.scss';

type TProps<T> = {
  data: T[];
  children: (item: T) => ReactNode;
  getKey: (item: T, index: number) => string | number;
  className?: string;
};

export const ColumnList = <T,>({ data, children, getKey, className }: TProps<T>) => {
  return (
    <ul className={clsx(styles.list, className)}>
      {data.map((item, index) => (
        <li key={getKey(item, index)} className={styles.list__item}>
          {children(item)}
        </li>
      ))}
    </ul>
  );
};
