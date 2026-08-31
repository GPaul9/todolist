import { CreateProjectParams, UpdateProjectParams } from '../../api/projectApi';

import {
  useArchiveProject,
  useCreateProject,
  useDeleteProject,
  useUnArchiveProject,
  useUpdateProject,
} from './useProjects';

export const useProjectActions = () => {
  const create = useCreateProject();
  const update = useUpdateProject();
  const deleteP = useDeleteProject();
  const archive = useArchiveProject();
  const unArchive = useUnArchiveProject();

  const actions = {
    create: (data: CreateProjectParams['data']) => create.mutateAsync({ data }),
    update: ({ projectId, data }: UpdateProjectParams) => update.mutateAsync({ projectId, data }),
    delete: (projectId: number) => deleteP.mutateAsync(projectId),
    archive: (projectId: number) => archive.mutateAsync(projectId),
    unArchive: (projectId: number) => unArchive.mutateAsync(projectId),
  };

  const isPending = {
    create: create.isPending,
    update: update.isPending,
    delete: deleteP.isPending,
    archive: archive.isPending,
    unArchive: unArchive.isPending,
  };

  const isAnyPending = Object.values(isPending).some(Boolean);

  return { actions, isPending, isAnyPending };
};
