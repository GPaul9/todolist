import { InfiniteData, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from 'app/providers/queryClient';
import { uploadAttachment, UploadAttachmentParams } from 'entities/attachment';
import { GetTasksListResponce } from 'entities/task/api/taskApi';
import { prependArrayItem, removeArrayItem, updateArrayItem, updateInfiniteItem } from 'shared/lib';
import { notice } from 'shared/ui';

import {
  createSubtask,
  CreateSubtaskParams,
  deleteSubtask,
  deleteSubtaskAttachment,
  DelSubtaskAttachmentParams,
  getSubtasks,
  updateSubtask,
  UpdateSubtaskParams,
} from '../../api/subtaskApi';
import { Subtask } from '../types/subtask';

export const useGetSubtask = (taskId: number) => {
  return useQuery<Subtask[]>({
    queryKey: ['subtasks', 'list', taskId],
    queryFn: () => getSubtasks(taskId),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
};

export const useCreateSubtask = () => {
  return useMutation({
    mutationFn: ({ taskId, data }: CreateSubtaskParams) => createSubtask({ taskId, data }),
    onSuccess: (response) => {
      queryClient.setQueryData<Subtask[]>(['subtasks', 'list', response.subtask.task_id], (old) =>
        prependArrayItem(old, response.subtask),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', response.task.task_list_id] },
        (old) => updateInfiniteItem(old, response.task),
      );
    },
    onError: () => {
      notice.error('Ошибка при создании подзадачи');
    },
  });
};

export const useUpdateSubtask = () => {
  return useMutation({
    mutationFn: ({ subtaskId, data }: UpdateSubtaskParams) => updateSubtask({ subtaskId, data }),
    onSuccess: (response) => {
      queryClient.setQueryData<Subtask[]>(['subtasks', 'list', response.subtask.task_id], (old) =>
        updateArrayItem(old, response.subtask),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', response.task.task_list_id] },
        (old) => updateInfiniteItem(old, response.task),
      );
    },
    onError: () => {
      notice.error('Ошибка при обновлении подзадачи');
    },
  });
};

export const useDeleteSubtask = () => {
  return useMutation({
    mutationFn: (subtaskId: number) => deleteSubtask(subtaskId),
    onSuccess: (response) => {
      queryClient.setQueryData<Subtask[]>(['subtasks', 'list', response.subtask.task_id], (old) =>
        removeArrayItem(old, response.subtask.id),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', response.task.task_list_id] },
        (old) => updateInfiniteItem(old, response.task),
      );
    },
    onError: () => {
      notice.error('Ошибка при удалении подзадачи');
    },
  });
};

// Attachment
export type SubtaskAttachmentParams = {
  file: UploadAttachmentParams['file'];
  subtaskId: number;
  taskId: number;
};

export const useUploadSubtaskAttachment = () => {
  return useMutation({
    mutationFn: ({ file, subtaskId }: SubtaskAttachmentParams) =>
      uploadAttachment({
        file,
        parent: {
          type: 'subtask',
          id: subtaskId,
        },
      }),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', 'list', taskId] });
    },
    onError: () => {
      notice.error('Ошибка при загрузке файла');
    },
  });
};

export const useDelSubtaskAttachment = () => {
  return useMutation({
    mutationFn: ({ subtaskId, attachmentId }: DelSubtaskAttachmentParams) =>
      deleteSubtaskAttachment({ subtaskId, attachmentId }),
    onSuccess: (response) => {
      queryClient.setQueryData<Subtask[]>(['subtasks', 'list', response.subtask.task_id], (old) =>
        updateArrayItem(old, response.subtask),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', response.task.task_list_id] },
        (old) => updateInfiniteItem(old, response.task),
      );
    },
    onError: () => {
      notice.error('Ошибка при удалении файла');
    },
  });
};
