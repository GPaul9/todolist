import { TagTaskParams, UpdateTaskParams } from '../../api/taskApi';

import {
  AddNewTagTaskParams,
  deleteTaskParams,
  useAddNewTagTask,
  useAddTagTask,
  useCreateTask,
  useDeleteTagTask,
  useDeleteTask,
  useUpdateTask,
} from './useTaskApi';

export type TypeTaskActions = ReturnType<typeof useTaskActions>['actions'];
export type TypeTaskPending = ReturnType<typeof useTaskActions>['isPending'];

export const useTaskActions = () => {
  const create = useCreateTask();
  const update = useUpdateTask();
  const deleteT = useDeleteTask();
  const addTag = useAddTagTask();
  const addNewTag = useAddNewTagTask();
  const deleteTag = useDeleteTagTask();

  const actions = {
    create: (listId: number) => create.mutateAsync(listId),
    update: ({ taskId, data }: UpdateTaskParams) => update.mutateAsync({ taskId, data }),
    delete: ({ listId, taskId }: deleteTaskParams) => deleteT.mutateAsync({ listId, taskId }),
    addTag: ({ taskId, tagId }: TagTaskParams) => addTag.mutateAsync({ taskId, tagId }),
    addNewTag: ({ taskId, data }: AddNewTagTaskParams) => addNewTag.mutateAsync({ taskId, data }),
    deleteTag: ({ taskId, tagId }: TagTaskParams) => deleteTag.mutateAsync({ taskId, tagId }),
  };

  const isPending = {
    create: create.isPending,
    update: update.isPending,
    delete: deleteT.isPending,
    addTag: addTag.isPending,
    addNewTag: addNewTag.isPending,
    deleteTag: deleteTag.isPending,
  };

  const isAnyPending = Object.values(isPending).some(Boolean);

  return { actions, isPending, isAnyPending };
};
