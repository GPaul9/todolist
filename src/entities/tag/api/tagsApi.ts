import { apiClient } from 'shared/api';

import { Tag, CreateTag, EditTag } from '../model/types/tag';

export const getTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>('/tags');
  return response.data;
};

export const createTag = async (data: CreateTag): Promise<Tag> => {
  const response = await apiClient.post<Tag>('/tags', data);
  return response.data;
};

export const editTag = async (data: EditTag): Promise<Tag> => {
  const response = await apiClient.patch<Tag>(`/tags/${data.id}`, data);
  return response.data;
};

export const deleteTag = async (id: number): Promise<void> => {
  await apiClient.delete(`/tags/${id}`);
};
