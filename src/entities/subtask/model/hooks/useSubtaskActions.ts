import {
  CreateSubtaskParams,
  DelSubtaskAttachmentParams,
  UpdateSubtaskParams,
} from '../../api/subtaskApi';

import {
  SubtaskAttachmentParams,
  useCreateSubtask,
  useDeleteSubtask,
  useDelSubtaskAttachment,
  useUpdateSubtask,
  useUploadSubtaskAttachment,
} from './useSubtaskApi';

export type TypeSubtaskActions = ReturnType<typeof useSubtaskActions>['actions'];
export type TypeSubtaskPending = ReturnType<typeof useSubtaskActions>['isPending'];

export const useSubtaskActions = () => {
  const create = useCreateSubtask();
  const update = useUpdateSubtask();
  const deleteS = useDeleteSubtask();
  const addAttachment = useUploadSubtaskAttachment();
  const delAttachment = useDelSubtaskAttachment();

  const actions = {
    create: ({ taskId, data }: CreateSubtaskParams) => create.mutateAsync({ taskId, data }),
    update: ({ subtaskId, data }: UpdateSubtaskParams) => update.mutateAsync({ subtaskId, data }),
    delete: (subtaskId: number) => deleteS.mutateAsync(subtaskId),
    addAttachment: ({ file, subtaskId, taskId }: SubtaskAttachmentParams) =>
      addAttachment.mutateAsync({ file, subtaskId, taskId }),
    delAttachment: ({ subtaskId, attachmentId }: DelSubtaskAttachmentParams) =>
      delAttachment.mutateAsync({ subtaskId, attachmentId }),
  };

  const isPending = {
    create: create.isPending,
    update: update.isPending,
    delete: deleteS.isPending,
    addAttachment: addAttachment.isPending,
    delAttachment: delAttachment.isPending,
  };

  const isAnyPending = Object.values(isPending).some(Boolean);

  return { actions, isPending, isAnyPending };
};
