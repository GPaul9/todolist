import clsx from 'clsx';

import styles from './FilterItem.module.scss';

type Props = {
  label: string;
  checked: boolean;
  onFilter: (checked: boolean) => void;
};

export const FilterItem = ({ label, checked, onFilter }: Props) => {
  return (
    <label className={clsx(styles.item)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onFilter(e.target.checked)}
        className={styles.item__checkbox}
      />

      {label}
    </label>
  );
};
