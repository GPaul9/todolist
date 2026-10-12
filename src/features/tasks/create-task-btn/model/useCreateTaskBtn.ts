import { useCreateTask } from 'entities/task';

export const useCreateTaskModel = (listId: number) => {
  const { mutate, isPending } = useCreateTask();

  const handleClick = () => {
    mutate(listId);
  };

  return { handleClick, isPending };
};
