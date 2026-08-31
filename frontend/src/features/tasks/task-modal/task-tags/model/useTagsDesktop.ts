import { useState, useMemo, KeyboardEvent, useEffect, useRef } from 'react';
import { useGetTags } from 'entities/tag';
import { COLORS } from 'shared/config/colors';

import { Task, TypeTaskActions } from 'entities/task';

interface TProps {
  task: Task;
  taskActions: TypeTaskActions;
  disabled?: boolean;
}

export const useTagsDesktop = ({ task, taskActions, disabled = false }: TProps) => {
  const { data: tags = [] } = useGetTags();
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isColor, setIsColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);

  const focusOff = () => {
    setIsFocused(false);
    setSearchValue('');
  };

  useEffect(() => {
    if (!isFocused) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        focusOff();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFocused]);

  const availableTags = useMemo(() => {
    const taskTagIds = task.tags.map((t) => t.id);
    return tags.filter((t) => !taskTagIds.includes(t.id));
  }, [tags, task.tags]);

  const filteredTags = availableTags.filter((t) =>
    t.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const newTag = searchValue.trim() !== '' && filteredTags.length === 0;

  const handleAdd = (tagId: number) => {
    if (disabled) return;
    taskActions.addTag({ taskId: task.id, tagId });
    setSearchValue('');
  };

  const handleCreateNew = () => {
    if (disabled || !searchValue.trim()) return;
    taskActions.addNewTag({
      taskId: task.id,
      data: { name: searchValue, color: isColor },
    });
    setSearchValue('');
  };

  const handleKeyAction = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();

      const existingTag = task.tags.some(
        (t) => t.name.toLowerCase() === searchValue.trim().toLowerCase(),
      );

      if (existingTag) {
        setError('Тег уже добавлен к задаче');
        return;
      }

      if (newTag) {
        handleCreateNew();
      } else if (filteredTags.length > 0) {
        handleAdd(filteredTags[0].id);
      }
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      focusOff();
    }
  };

  return {
    isFocused,
    setIsFocused,
    searchValue,
    setSearchValue,
    isColor,
    setIsColor,
    error,
    setError,
    containerRef,
    filteredTags,
    newTag,
    colorsList: COLORS,
    handleAdd,
    handleCreateNew,
    handleKeyAction,
  };
};
