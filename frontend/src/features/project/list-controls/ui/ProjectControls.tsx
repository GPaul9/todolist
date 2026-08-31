import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { Button, SearchInput, SortItem } from 'shared/ui';

import { useProjectControls } from '../model/useProjectControls';

import styles from './ProjectControls.module.scss';

type TProps = {
  params: URLSearchParams;
  setParams: (params: URLSearchParams) => void;
  onClose: () => void;
};

export const ProjectControls = ({ params, setParams, onClose }: TProps) => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const { controls, handleSearch, handleSort, handleApply, handleReset } = useProjectControls(
    params,
    setParams,
  );

  const getTitleLabel = () =>
    controls.order === 'desc' && controls.sort_by === 'title' ? 'От Я до А' : 'От А до Я';

  const handleControlsApply = () => {
    handleApply();
    onClose();
  };

  return (
    <div className={styles.controls}>
      {isTablet && (
        <SearchInput
          value={controls.search}
          onChange={(value) => handleSearch(value)}
          className={styles.controls__search}
        />
      )}
      <div className={styles.controls__wrapper}>
        <div className={styles['controls__part-block']}>
          <p className={styles.controls__title}>Сортировка по алфавиту</p>

          <div className={styles.controls__values}>
            <SortItem
              label={getTitleLabel()}
              field="title"
              order={controls.order}
              isActive={controls.sort_by === 'title'}
              onSort={handleSort}
            />
          </div>
        </div>

        <div className={styles['controls__part-block']}>
          <p className={styles.controls__title}>Сортировка по дате</p>

          <div className={styles.controls__values}>
            <SortItem
              label="Дата создания"
              field="created_at"
              order={controls.order}
              isActive={controls.sort_by === 'created_at'}
              onSort={handleSort}
            />
            <SortItem
              label="Дата изменения"
              field="updated_at"
              order={controls.order}
              isActive={controls.sort_by === 'updated_at'}
              onSort={handleSort}
            />
          </div>
        </div>

        <div className={styles['controls__btn-wrapper']}>
          <Button className={styles.controls__btn} kind="secondary" onClick={handleReset}>
            Сбросить
          </Button>
          <Button className={styles.controls__btn} kind="primary" onClick={handleControlsApply}>
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
};
