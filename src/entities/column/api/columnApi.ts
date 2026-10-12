import { apiClient, ApiResponse, PaginationMeta } from 'shared/api';

import { Column, ColumnStatus } from '../model/types/column';

// createColumn
export const createColumn = async (projectId: number): Promise<Column> => {
  const response = await apiClient.post<Column>(`/lists/project/${projectId}`, {
    title: 'Новый список',
    status: 'active',
  });
  return response.data;
};

// getColumns
export type GetColumnsParams = {
  project_id: number;
  page?: number;
  count?: number;
  statuses?: ColumnStatus[];
};
export type GetColumnsResponce = ApiResponse<Column[], PaginationMeta>;

export const getColumns = async ({
  project_id,
  page = 1,
  count = 5,
  statuses = ['active'],
}: GetColumnsParams): Promise<GetColumnsResponce> => {
  const response = await apiClient.get(`/lists/project/${project_id}`, {
    params: {
      page,
      count,
      statuses,
    },
  });
  return response.data;
};

export const getAllColumns = async ({
  page = 1,
  count = 5,
  statuses = ['active'],
}: Omit<GetColumnsParams, 'project_id'>): Promise<GetColumnsResponce> => {
  const response = await apiClient.get(`/lists/all/`, {
    params: {
      page,
      count,
      statuses,
    },
  });
  return response.data;
};

// updateColumn
export type UpdateColumnParams = {
  listId: number;
  data: Partial<Pick<Column, 'title' | 'order' | 'status'>>;
};

export const updateColumn = async ({ listId, data }: UpdateColumnParams): Promise<Column> => {
  const response = await apiClient.patch(`/lists/${listId}`, data);

  return response.data;
};

// deleteColumn
export const deleteColumn = async (listId: number): Promise<void> => {
  await apiClient.delete(`/lists/${listId}`);
};

// archiveColumn
export const archiveColumn = async (listId: number): Promise<Column> => {
  const response = await apiClient.patch(`/lists/${listId}/archive`);

  return response.data;
};

// unArchiveColumn
export const unArchiveColumn = async (listId: number): Promise<Column> => {
  const response = await apiClient.patch(`/lists/${listId}/unarchive`);

  return response.data;
};
