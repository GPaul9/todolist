import { useCreateProject } from 'entities/project';

export const useCreateProjectBtn = () => {
  const { mutate, isPending } = useCreateProject();

  const handleCreate = () => {
    mutate({
      data: {
        title: 'Новый проект',
        description: null,
        status: 'active',
      },
    });
  };

  return { handleCreate, isPending };
};
