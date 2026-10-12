import { UpdateColumnParams } from '../../api/columnApi';

import {
  useArchiveColumn,
  useCreateColumn,
  useDeleteColumn,
  useUnArchiveColumn,
  useUpdateColumn,
} from './useColumnApi';

type TProps = {
  projectId: number;
  listId: number;
};

export const useColumnActions = ({ projectId, listId }: TProps) => {
  const create = useCreateColumn();
  const update = useUpdateColumn();
  const deleteC = useDeleteColumn();
  const archive = useArchiveColumn();
  const unArchive = useUnArchiveColumn();

  const actions = {
    create: () => create.mutateAsync(projectId),
    update: (data: UpdateColumnParams['data']) => update.mutateAsync({ listId, data }),
    delete: () => deleteC.mutateAsync({ listId, projectId }),
    archive: () => archive.mutateAsync(listId),
    unArchive: () => unArchive.mutateAsync(listId),
  };

  const isPending = {
    create: create.isPending,
    update: update.isPending,
    delete: deleteC.isPending,
    archive: archive.isPending,
    unArchive: unArchive.isPending,
  };

  const isAnyPending = Object.values(isPending).some(Boolean);

  return { actions, isPending, isAnyPending };
};
