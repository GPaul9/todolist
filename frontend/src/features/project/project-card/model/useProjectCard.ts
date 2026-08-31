import { useNavigate } from 'react-router-dom';

import { queryClient } from 'app/providers/queryClient';
import { Project, useProjectActions } from 'entities/project';
import { useDialog } from 'shared/lib';

export const useProjectCard = (project: Project) => {
  const dialog = useDialog();
  const navigate = useNavigate();

  const { actions, isAnyPending } = useProjectActions();

  const isArchived = project.status !== 'active';

  const handleOpen = () => {
    queryClient.setQueryData(['project', project.id], project);
    navigate(isArchived ? `/project/${project.id}/archive` : `/project/${project.id}`);
  };

  const handleArchive = async () => {
    const ok = await dialog.confirm({
      title: !isArchived ? 'Переместить проект в архив?' : undefined,
      description: isArchived
        ? 'Восстановить проект?'
        : 'Он будет скрыт из списка, но останется доступным для восстановления. Полное удаление произойдёт через 90 дней.',
    });
    if (ok) return isArchived ? actions.unArchive(project.id) : actions.archive(project.id);
  };

  const handleDelete = async () => {
    const ok = await dialog.confirm({
      title: 'Удалить проект?',
      description: 'Все данные будут удалены без возможности восстановления.',
    });
    if (ok) return actions.delete(project.id);
  };

  return {
    isArchived,
    isAnyPending,
    handleOpen,
    handleArchive,
    handleDelete,
  };
};
