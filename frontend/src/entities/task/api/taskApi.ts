import { Attachment } from 'entities/attachment';
import { TaskControlsType } from 'features/tasks/list-controls/model/taskTypes';
import { apiClient, ApiResponse, PaginationMeta } from 'shared/api';

import { Priority, Status, Task } from '../model/types/tasks';

// getTasksList
export type GetTasksListParams = {
  list_id: number;
  params: {
    search?: string;
    status?: Status[];
    priority?: Priority[];
    date_from?: Date;
    date_to?: Date;
    tags_ids?: number[];
    sort_by?: TaskControlsType['sort_by'];
    order?: TaskControlsType['order'];
    page?: number;
    size?: number;
    archived: boolean;
  };
};

export type GetTasksListResponce = ApiResponse<Task[], PaginationMeta>;

export const getTasksList = async ({
  list_id,
  params,
}: GetTasksListParams): Promise<GetTasksListResponce> => {
  const response = await apiClient.get<GetTasksListResponce>(`/lists/${list_id}/tasks`, {
    params,
  });
  return response.data;
};

// createTask
export type CreateTaskParams = {
  listId: number;
  data: Pick<Task, 'title'> &
    Partial<Pick<Task, 'description' | 'deadline' | 'status' | 'priority'>>;
};

export const createTask = async ({ listId, data }: CreateTaskParams): Promise<Task> => {
  const response = await apiClient.post<Task>(`/lists/${listId}/tasks`, data);

  return response.data;
};

// updateTask
export type UpdateTaskParams = {
  taskId: number;
  data: Partial<Pick<Task, 'title' | 'description' | 'deadline' | 'status' | 'priority'>>;
};

export const updateTask = async ({ taskId, data }: UpdateTaskParams): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/tasks/${taskId}`, data);

  return response.data;
};

// deleteTask
export const deleteTask = async (taskId: number): Promise<void> => {
  const response = await apiClient.delete(`/tasks/${taskId}`);

  return response.data;
};

// TagTask
export type TagTaskParams = {
  taskId: number;
  tagId: number;
};

export const addTagTask = async ({ taskId, tagId }: TagTaskParams): Promise<Task> => {
  const response = await apiClient.post(`/tasks/${taskId}/tags/${tagId}`);

  return response.data;
};
export const deleteTagTask = async ({ taskId, tagId }: TagTaskParams): Promise<Task> => {
  const response = await apiClient.delete(`/tasks/${taskId}/tags/${tagId}`);

  return response.data;
};

// reorderTask
export type ReorderTaskParams = {
  taskId: number;
  data: {
    new_position: number;
    new_task_list_id: number;
  };
};
export const reorderTask = async ({ taskId, data }: ReorderTaskParams): Promise<Task> => {
  const response = await apiClient.patch(`tasks/${taskId}/reorder`, data);

  return response.data;
};

// Attachment
export const getTaskAttachments = async (taskId: number): Promise<Attachment[]> => {
  const response = await apiClient.get<Attachment[]>(`/tasks/${taskId}/attachments`);

  return response.data;
};

export type TaskAttachmentResponce = {
  attachment: Attachment;
  task: Task;
};

export type DelTaskAttachmentParams = {
  taskId: number;
  attachmentId: string;
};

export const deleteTaskAttachment = async ({
  taskId,
  attachmentId,
}: DelTaskAttachmentParams): Promise<TaskAttachmentResponce> => {
  const response = await apiClient.delete<TaskAttachmentResponce>(
    `/tasks/${taskId}/attachments/${attachmentId}`,
  );

  return response.data;
};
