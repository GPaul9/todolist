import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { PriorityBadge } from 'entities/task';
import { Button, FilterItem, SearchInput, SortItem } from 'shared/ui';

import { useTaskControls } from '../model/useTaskControls';

import { TagList } from './components/TagList';
import { TaskDatePicker } from './components/TaskDatePicker';
import styles from './TaskControls.module.scss';

type TProps = {
  params: URLSearchParams;
  setParams: (params: URLSearchParams) => void;
  onClose: () => void;
};

export const TaskControls = ({ params, setParams, onClose }: TProps) => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const { controls, handleSearch, handleSort, handleFilter, handleDate, handleApply, handleReset } =
    useTaskControls(params, setParams);

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
              label="Дата выполнения"
              field="deadline"
              order={controls.order}
              isActive={controls.sort_by === 'deadline'}
              onSort={handleSort}
            />
            <SortItem
              label="Дата создания"
              field="created_at"
              order={controls.order}
              isActive={controls.sort_by === 'created_at'}
              onSort={handleSort}
            />
          </div>
        </div>

        <div className={styles['controls__part-block']}>
          <p className={styles.controls__title}>Фильтры</p>

          <div className={styles['controls__filter-values']}>
            <div className={styles.controls__filter}>
              <p className={styles.controls__subtitle}>По дате создания</p>

              <TaskDatePicker
                selected={{ from: controls.date_from, to: controls.date_to }}
                setSelected={(value) => handleDate(value)}
              />
            </div>

            <div className={styles.controls__filter}>
              <p className={styles.controls__subtitle}>По статусу</p>

              <div className={styles.controls__values}>
                <FilterItem
                  label="Запланирована"
                  checked={controls.sts.includes('todo')}
                  onFilter={(checked) => handleFilter('sts', 'todo', checked)}
                />
                <FilterItem
                  label="В работе"
                  checked={controls.sts.includes('in_progress')}
                  onFilter={(checked) => handleFilter('sts', 'in_progress', checked)}
                />
                <FilterItem
                  label="Завершена"
                  checked={controls.sts.includes('done')}
                  onFilter={(checked) => handleFilter('sts', 'done', checked)}
                />
              </div>
            </div>

            <div className={styles.controls__filter}>
              <p className={styles.controls__subtitle}>По приоритету</p>

              <div className={styles.controls__priority}>
                <PriorityBadge
                  priority="low"
                  isActive={controls.priority.includes('low')}
                  onClick={() =>
                    handleFilter('priority', 'low', !controls.priority.includes('low'))
                  }
                />
                <PriorityBadge
                  priority="medium"
                  isActive={controls.priority.includes('medium')}
                  onClick={() =>
                    handleFilter('priority', 'medium', !controls.priority.includes('medium'))
                  }
                />
                <PriorityBadge
                  priority="high"
                  isActive={controls.priority.includes('high')}
                  onClick={() =>
                    handleFilter('priority', 'high', !controls.priority.includes('high'))
                  }
                />
              </div>
            </div>

            <div className={styles.controls__filter}>
              <p className={styles.controls__subtitle}>По тегам</p>

              <TagList
                paramsList={controls.tags_ids}
                onChange={(tagId, checked) => handleFilter('tags_ids', tagId, checked)}
              />
            </div>
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
