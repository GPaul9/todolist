import { useCreateColumn } from 'entities/column';

export const useCreateColumnBtn = (projectId: number) => {
  const { mutate, isPending } = useCreateColumn();

  const handleClick = () => {
    mutate(projectId);
  };

  return { handleClick, isPending };
};
