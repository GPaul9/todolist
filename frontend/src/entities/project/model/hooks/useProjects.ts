import {
  InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { queryClient } from 'app/providers/queryClient';
import { PaginationMeta } from 'shared/api';
import { notice } from 'shared/ui';

import {
  archiveProject,
  createProject,
  CreateProjectParams,
  deleteProject,
  getProjectById,
  GetProjectListParams,
  GetProjectListResponce,
  getProjectsList,
  unArchiveProject,
  updateProject,
  UpdateProjectParams,
} from '../../api/projectApi';
import { Project, ProjectStatus } from '../types/project';

type ProjectsQueryKey = ['projects', string, boolean, string];

type UseProjectsListInfiniteParams = {
  params: Omit<GetProjectListParams['params'], 'page' | 'statuses'>;
  isArchived?: boolean;
  enabled?: boolean;
};

export const useProjectsListInfinite = ({
  params,
  isArchived = false,
  enabled,
}: UseProjectsListInfiniteParams) => {
  const statuses: ProjectStatus[] = isArchived ? ['archived_by_user'] : ['active'];

  return useInfiniteQuery<
    GetProjectListResponce,
    Error,
    InfiniteData<GetProjectListResponce>,
    ProjectsQueryKey,
    number
  >({
    queryKey: ['projects', 'list', isArchived, JSON.stringify(params)],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getProjectsList({
        params: {
          ...params,
          page: pageParam,
          statuses,
        },
      });

      // queryClient.setQueryData(['projects', 'meta', isArchived], {
      //   totalCount: res.meta.totalCount,
      // });

      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined;
    },
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

type UseProjectsListParams = {
  params: Omit<GetProjectListParams['params'], 'statuses'>;
  isArchived?: boolean;
  enabled?: boolean;
};

export const useProjectsList = ({ params, isArchived = false, enabled }: UseProjectsListParams) => {
  const statuses: ProjectStatus[] = isArchived ? ['archived_by_user'] : ['active'];

  return useQuery<GetProjectListResponce, Error>({
    queryKey: ['projects', 'list', isArchived, JSON.stringify(params)],
    queryFn: async () => {
      const res = await getProjectsList({
        params: {
          ...params,
          statuses,
        },
      });

      // queryClient.setQueryData(['projects', 'meta', isArchived], {
      //   totalCount: res.meta.totalCount,
      // });

      return res;
    },
    placeholderData: keepPreviousData,
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

type UseProjectById = {
  projectId: number;
  enabled?: boolean;
};

export const useProjectById = ({ projectId, enabled }: UseProjectById) => {
  return useQuery<Project, AxiosError>({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  return useMutation({
    mutationFn: ({ data }: CreateProjectParams) => createProject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', false] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'meta', false] });
    },
    onError: () => {
      notice.error('Нe удалось создать новый проект. Попробуйте позже');
    },
  });
};

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: ({ projectId, data }: UpdateProjectParams) => updateProject({ projectId, data }),
    onSuccess: (project) => {
      notice.success('Изменения проекта сохранены');
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', false] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    },
    onError: () => {
      notice.error('Нe удалось сохранить изменения. Попробуйте позже');
    },
  });
};

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: (projectId: number) => deleteProject(projectId),
    onSuccess: (_, projectId) => {
      notice.success('Проект успешно удален');
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'meta', false] });
    },
    onError: () => {
      notice.error('Не удалось удалить проект. Попробуйте позже');
    },
  });
};

export const useArchiveProject = () => {
  return useMutation({
    mutationFn: (projectId: number) => archiveProject(projectId),
    onSuccess: (_, projectId) => {
      notice.success('Проект отправлен в архив');
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'meta', false] });
      queryClient.invalidateQueries({ queryKey: ['columns', 'all', true] });
    },
    onError: () => {
      notice.error('Не удалось архивировать проект. Попробуйте позже');
    },
  });
};

export const useUnArchiveProject = () => {
  return useMutation({
    mutationFn: (projectId: number) => unArchiveProject(projectId),
    onSuccess: (_, projectId) => {
      notice.success('Проект восстановлен');
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'meta', false] });
      queryClient.invalidateQueries({ queryKey: ['columns', 'all', true] });
    },
    onError: () => {
      notice.error('Не удалось вернуть проект. Попробуйте позже');
    },
  });
};

type UseProjectsMetaParams = {
  isArchived?: boolean;
  enabled?: boolean;
};
type UseProjectsMetaResponce = {
  totalCount: PaginationMeta['totalCount'];
};

export const useProjectsMeta = (params?: UseProjectsMetaParams) => {
  const { isArchived = false, enabled = true } = params ?? {};
  const statuses: ProjectStatus[] = isArchived ? ['archived_by_user'] : ['active'];

  return useQuery<UseProjectsMetaResponce, Error>({
    queryKey: ['projects', 'meta', isArchived],
    queryFn: async () => {
      const res = await getProjectsList({
        params: {
          page: 1,
          count: 1,
          statuses,
        },
      });

      return { totalCount: res.meta.totalCount };
    },
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};
