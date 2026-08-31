import { InfiniteData, useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { queryClient } from 'app/providers/queryClient';
import { prependInfiniteItem, removeInfiniteItem, updateInfiniteItem } from 'shared/lib';

import {
  archiveColumn,
  createColumn,
  deleteColumn,
  getAllColumns,
  getColumns,
  GetColumnsParams,
  GetColumnsResponce,
  unArchiveColumn,
  updateColumn,
  UpdateColumnParams,
} from '../../api/columnApi';
import { ColumnStatus } from '../types/column';

type ColumnsQueryKey = ['columns', 'list', GetColumnsParams['project_id'], boolean];
type ColumnsAllQueryKey = ['columns', 'all', boolean];

export const useCreateColumn = () => {
  return useMutation({
    mutationFn: (projectId: number) => createColumn(projectId),
    onSuccess: (column) => {
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(
        ['columns', 'list', column.project_id, false],
        (old) => prependInfiniteItem(old, column),
      );
    },
  });
};

type UseGetColumnsParams = {
  params: GetColumnsParams;
  isArchived?: boolean;
};

export const useGetColumns = ({ params, isArchived = false }: UseGetColumnsParams) => {
  const statuses: ColumnStatus[] = isArchived
    ? ['archived_by_cascade', 'archived_by_user_and_cascade']
    : ['active'];

  return useInfiniteQuery<
    GetColumnsResponce,
    Error,
    InfiniteData<GetColumnsResponce>,
    ColumnsQueryKey,
    number
  >({
    queryKey: ['columns', 'list', params.project_id, isArchived],
    queryFn: ({ pageParam = 1 }) => getColumns({ ...params, statuses, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined;
    },
    enabled: !!params.project_id,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetAllColumns = (params: Omit<GetColumnsParams, 'project_id'>) => {
  const isArchived: boolean = !!!params.statuses?.includes('active');

  return useInfiniteQuery<
    GetColumnsResponce,
    Error,
    InfiniteData<GetColumnsResponce>,
    ColumnsAllQueryKey,
    number
  >({
    queryKey: ['columns', 'all', isArchived],
    queryFn: ({ pageParam = 1 }) => getAllColumns({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateColumn = () => {
  return useMutation({
    mutationFn: ({ listId, data }: UpdateColumnParams) => updateColumn({ listId, data }),
    onSuccess: (column) => {
      queryClient.setQueriesData<InfiniteData<GetColumnsResponce>>(
        { queryKey: ['columns', 'list', column.project_id] },
        (old) => updateInfiniteItem(old, column),
      );
    },
  });
};

export type DeleteColumnParams = {
  listId: number;
  projectId: number;
};
export const useDeleteColumn = () => {
  return useMutation({
    mutationFn: ({ listId }: DeleteColumnParams) => deleteColumn(listId),
    onSuccess: (_, { listId, projectId }) => {
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(
        ['columns', 'list', projectId, true],
        (old) => removeInfiniteItem(old, listId),
      );
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(['columns', 'all', true], (old) =>
        removeInfiniteItem(old, listId),
      );
    },
  });
};

export const useArchiveColumn = () => {
  return useMutation({
    mutationFn: (listId: number) => archiveColumn(listId),
    onSuccess: (column) => {
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(
        ['columns', 'list', column.project_id, false],
        (old) => removeInfiniteItem(old, column.id),
      );
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(
        ['columns', 'list', column.project_id, true],
        (old) => prependInfiniteItem(old, column),
      );
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(['columns', 'all', true], (old) =>
        prependInfiniteItem(old, column),
      );
    },
  });
};

export const useUnArchiveColumn = () => {
  return useMutation({
    mutationFn: (listId: number) => unArchiveColumn(listId),
    onSuccess: (column) => {
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(
        ['columns', 'list', column.project_id, true],
        (old) => removeInfiniteItem(old, column.id),
      );
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(
        ['columns', 'list', column.project_id, false],
        (old) => prependInfiniteItem(old, column),
      );
      queryClient.setQueryData<InfiniteData<GetColumnsResponce>>(['columns', 'all', true], (old) =>
        removeInfiniteItem(old, column.id),
      );
    },
  });
};
