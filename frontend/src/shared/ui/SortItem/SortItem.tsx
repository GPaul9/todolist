import clsx from 'clsx';

import SortIcon from 'assets/check-sort-icon.svg?react';

import styles from './SortItem.module.scss';

type TProps<TField extends string> = {
  label: string;
  field: TField;
  order: 'asc' | 'desc';
  isActive: boolean;
  onSort: (field: TField) => void;
};

export const SortItem = <TField extends string>({
  label,
  isActive,
  field,
  order,
  onSort,
}: TProps<TField>) => {
  return (
    <button className={styles.item} onClick={() => onSort(field)}>
      {isActive && (
        <SortIcon
          className={clsx(styles.item__icon, order === 'desc' && styles.item__icon_active)}
        />
      )}

      {label}
    </button>
  );
};
