import { useGetTags } from 'entities/tag';
import { Spinner, TagBadge } from 'shared/ui';

import styles from './TagList.module.scss';

type TProps = {
  paramsList: number[];
  onChange: (tagId: number, checked: boolean) => void;
};

export const TagList = ({ paramsList, onChange }: TProps) => {
  const { data, isError, isLoading } = useGetTags();

  if (isLoading) return <Spinner size={20} />;

  if (!data || isError)
    return (
      <p className={styles.tags__empty}>
        *Не удалось получить теги, или Вы их ещё не добавили. Это можно сделать в профиле.
      </p>
    );

  return (
    <div className={styles.tags}>
      {data.map((tag) => {
        const isActive = paramsList.includes(tag.id);

        return (
          <TagBadge
            className={styles.tags__item}
            key={tag.id}
            name={tag.name}
            color={tag.color}
            isActive={isActive}
            onClick={() => onChange(tag.id, !isActive)}
          />
        );
      })}
    </div>
  );
};
