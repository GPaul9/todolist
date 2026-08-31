import { useState, useMemo, KeyboardEvent } from 'react';
import { useGetTags } from 'entities/tag';
import { COLORS } from 'shared/config/colors';

import { Task, TypeTaskActions, useTaskActions } from 'entities/task';

interface TProps {
  task: Task;
  taskActions: TypeTaskActions;
  onClose: () => void;
  disabled?: boolean;
}

export const useTagsList = ({ task, taskActions, onClose, disabled }: TProps) => {
  const { data: tags = [] } = useGetTags();
  const [searchValue, setSearchValue] = useState('');
  const [isColor, setIsColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<number | 'new' | null>(null);

  const availableTags = useMemo(() => {
    const taskTagIds = task.tags.map((t) => t.id);
    return tags.filter((t) => !taskTagIds.includes(t.id));
  }, [tags, task.tags]);

  const filteredTags = availableTags.filter((t) =>
    t.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const newTag = searchValue.trim() !== '' && filteredTags.length === 0;

  const handleAdd = async () => {
    if (disabled) return;
    const existingTag = task.tags.some(
      (t) => t.name.toLowerCase() === searchValue.trim().toLowerCase(),
    );

    if (existingTag) {
      setError('Тег уже добавлен к задаче');
      return;
    }

    if (selectedTag === 'new' && searchValue.trim()) {
      await taskActions.addNewTag({
        taskId: task.id,
        data: { name: searchValue, color: isColor },
      });
    } else if (typeof selectedTag === 'number') {
      await taskActions.addTag({ taskId: task.id, tagId: selectedTag });
    } else {
      onClose();
      return;
    }

    setSearchValue('');
    setSelectedTag(null);
    onClose();
  };

  return {
    searchValue,
    setSearchValue,
    isColor,
    setIsColor,
    error,
    setError,
    selectedTag,
    setSelectedTag,
    filteredTags,
    newTag,
    colorsList: COLORS,
    handleAdd,
  };
};
