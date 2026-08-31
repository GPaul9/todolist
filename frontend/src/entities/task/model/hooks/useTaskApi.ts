import { InfiniteData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from 'app/providers/queryClient';
import { Attachment, uploadAttachment, UploadAttachmentParams } from 'entities/attachment';
import { CreateTag, createTag } from 'entities/tag';
import {
  prependInfiniteItem,
  removeArrayItem,
  removeInfiniteItem,
  updateInfiniteItem,
} from 'shared/lib';
import { notice } from 'shared/ui';

import {
  addTagTask,
  createTask,
  CreateTaskParams,
  deleteTagTask,
  deleteTask,
  deleteTaskAttachment,
  DelTaskAttachmentParams,
  getTaskAttachments,
  getTasksList,
  GetTasksListParams,
  GetTasksListResponce,
  reorderTask,
  ReorderTaskParams,
  TagTaskParams,
  updateTask,
  UpdateTaskParams,
} from '../../api/taskApi';
import { Task } from '../types/tasks';

type TasksQueryKey = ['tasks', string, number, boolean, string];

type UseTasksListParams = Omit<GetTasksListParams, 'params'> & {
  params: Omit<GetTasksListParams['params'], 'page' | 'archived'>;
  isArchived?: boolean;
};

export const useTasksList = ({ list_id, params, isArchived = false }: UseTasksListParams) => {
  return useInfiniteQuery<
    GetTasksListResponce,
    Error,
    InfiniteData<GetTasksListResponce>,
    TasksQueryKey,
    number
  >({
    queryKey: ['tasks', 'list', list_id, isArchived, JSON.stringify(params)],
    queryFn: ({ pageParam = 1 }) =>
      getTasksList({ list_id, params: { ...params, page: pageParam, archived: isArchived } }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined;
    },
    enabled: !!list_id,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (listId: CreateTaskParams['listId']) =>
      createTask({
        listId,
        data: {
          title: 'Новая задача',
          status: 'todo',
        },
      }),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', task.task_list_id] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', false] });
    },
    onError: () => {
      notice.error('Ошибка при создании задачи');
    },
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ taskId, data }: UpdateTaskParams) => updateTask({ taskId, data }),
    onSuccess: (task, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', task.task_list_id] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', false] });
      if (data.status === 'done') {
        notice.success('Задача успешно завершена');
      }
    },
    onError: () => {
      notice.error('Ошибка при обновлении задачи');
    },
  });
};

export type deleteTaskParams = {
  listId: number;
  taskId: number;
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: ({ taskId }: deleteTaskParams) => deleteTask(taskId),
    onSuccess: (_, { listId, taskId }) => {
      notice.success('Задача успешно удалена');
      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', listId] },
        (old) => removeInfiniteItem(old, taskId),
      );
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', false] });
      
    },
    onError: () => {
      notice.error('Ошибка при удалении задачи');
    },
  });
};

export const useAddTagTask = () => {
  return useMutation({
    mutationFn: ({ taskId, tagId }: TagTaskParams) => addTagTask({ taskId, tagId }),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', task.task_list_id] });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;

      if (detail === 'Tag already added to this task') {
        notice.error('Этот тег уже добавлен к задаче');
        return;
      }

      notice.error(detail || 'Ошибка при добавлении тега');
    },
  });
};

export type AddNewTagTaskParams = {
  taskId: number;
  data: CreateTag;
};
export const useAddNewTagTask = () => {
  return useMutation({
    mutationFn: async ({ taskId, data }: AddNewTagTaskParams) => {
      const newTag = await createTag(data);

      const updatedTask = await addTagTask({
        taskId,
        tagId: newTag.id,
      });

      return updatedTask;
    },

    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', task.task_list_id] });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;

      if (detail === 'Tag limit reached (max 25)') {
        notice.error('Достигнут лимит тегов (максимум 25)');
        return;
      }

      if (detail === 'Tag already added to this task') {
        notice.error('Этот тег уже добавлен к задаче');
        return;
      }

      if (detail.includes('exists')) {
        notice.error('Это тег уже привязан к задаче');
        return;
      }

      notice.error(detail || 'Ошибка при создании нового тега');
    },
  });
};

export const useDeleteTagTask = () => {
  return useMutation({
    mutationFn: ({ taskId, tagId }: TagTaskParams) => deleteTagTask({ taskId, tagId }),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', task.task_list_id] });
    },
    onError: () => {
      notice.error('Ошибка при удалении тега');
    },
  });
};

type useReorderTaskParams = ReorderTaskParams & {
  taskData: Task;
};

export const useReorderTask = () => {
  return useMutation({
    mutationFn: ({ taskId, data }: useReorderTaskParams) => reorderTask({ taskId, data }),
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'list'] });

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', params.taskData.task_list_id] },
        (old) => removeInfiniteItem(old, params.taskId),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', params.data.new_task_list_id] },
        (old) =>
          prependInfiniteItem(old, {
            ...params.taskData,
            task_list_id: params.data.new_task_list_id,
          }),
      );
    },
    onSettled: (_task, _err, params) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'list', params.taskData.task_list_id],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks', 'list', params.data.new_task_list_id],
      });
    },
  });
};

// Attachment
export const useGetTaskAttachments = (taskId: number) => {
  return useQuery<Attachment[]>({
    queryKey: ['task-attachments', 'list', taskId],
    queryFn: () => getTaskAttachments(taskId),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
};

export type TaskAttachmentParams = {
  file: UploadAttachmentParams['file'];
  taskId: number;
  listId: number;
};

export const useUploadTaskAttachment = () => {
  return useMutation({
    mutationFn: ({ file, taskId }: TaskAttachmentParams) =>
      uploadAttachment({
        file,
        parent: {
          type: 'task',
          id: taskId,
        },
      }),
    onSuccess: (_, { listId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', listId] });
      queryClient.invalidateQueries({ queryKey: ['task-attachments', 'list', taskId] });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;

      if (detail === 'Count attachments for task type should be less or equal 5') {
        notice.error('Нельзя добавлять больше 5 вложений');
        return;
      }

      notice.error(detail || 'Ошибка при загрузке файла');
    },
  });
};

export const useDelTaskAttachment = () => {
  return useMutation({
    mutationFn: ({ taskId, attachmentId }: DelTaskAttachmentParams) =>
      deleteTaskAttachment({ taskId, attachmentId }),
    onSuccess: (response) => {
      queryClient.setQueryData<Attachment[]>(
        ['task-attachments', 'list', response.task.id],
        (old) => removeArrayItem(old, response.attachment.id),
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
