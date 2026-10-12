import { Task } from 'entities/task';
import { apiClient } from 'shared/api';

import { Subtask } from '../model/types/subtask';

export type SubtaskResponse = {
  subtask: Subtask;
  task: Task;
};

// getSubtasks
export const getSubtasks = async (taskId: number): Promise<Subtask[]> => {
  const response = await apiClient.get<Subtask[]>(`/tasks/${taskId}/subtasks`);

  return response.data;
};

// createSubtask
export type CreateSubtaskParams = {
  taskId: number;
  data: Pick<Subtask, 'title' | 'status'>;
};

export const createSubtask = async ({
  taskId,
  data,
}: CreateSubtaskParams): Promise<SubtaskResponse> => {
  const response = await apiClient.post<SubtaskResponse>(`/tasks/${taskId}/subtasks`, data);

  return response.data;
};

// updateSubtask
export type UpdateSubtaskParams = {
  subtaskId: number;
  data: Partial<Pick<Subtask, 'title' | 'status'>>;
};

export const updateSubtask = async ({
  subtaskId,
  data,
}: UpdateSubtaskParams): Promise<SubtaskResponse> => {
  const response = await apiClient.patch<SubtaskResponse>(`/subtasks/${subtaskId}`, data);

  return response.data;
};

// deleteSubtask
export const deleteSubtask = async (subtaskId: number): Promise<SubtaskResponse> => {
  const response = await apiClient.delete<SubtaskResponse>(`/subtasks/${subtaskId}`);

  return response.data;
};

// deleteAttachment
export type DelSubtaskAttachmentParams = {
  subtaskId: number;
  attachmentId: string;
};

export const deleteSubtaskAttachment = async ({
  subtaskId,
  attachmentId,
}: DelSubtaskAttachmentParams): Promise<SubtaskResponse> => {
  const response = await apiClient.delete<SubtaskResponse>(
    `/subtasks/${subtaskId}/attachments/${attachmentId}`,
  );

  return response.data;
};
