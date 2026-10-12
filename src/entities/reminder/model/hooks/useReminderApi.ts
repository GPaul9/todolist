import { InfiniteData, useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from 'app/providers/queryClient';
import { GetTasksListResponce } from 'entities/task/api/taskApi';
import { prependArrayItem, removeArrayItem, updateArrayItem, updateInfiniteItem } from 'shared/lib';
import { notice } from 'shared/ui';

import {
  createReminder,
  CreateReminderParams,
  deleteReminder,
  getReminders,
  updateReminder,
  UpdateReminderParams,
} from '../../api/reminderApi';
import { Reminder } from '../types/reminder';

export const useGetReminders = (taskId: number) => {
  return useQuery<Reminder[]>({
    queryKey: ['reminders', 'list', taskId],
    queryFn: () => getReminders(taskId),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
};

export const useCreateReminder = () => {
  return useMutation({
    mutationFn: ({ taskId, data }: CreateReminderParams) => createReminder({ taskId, data }),
    onSuccess: (response) => {
      queryClient.setQueryData<Reminder[]>(
        ['reminders', 'list', response.reminder.task_id],
        (old) => prependArrayItem(old, response.reminder),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', response.task.id] },
        (old) => updateInfiniteItem(old, response.task),
      );
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;

      if (detail === 'Count of reminders must be equal or less than 5') {
        notice.error('Нельзя добавлять больше 5 напоминаний');
        return;
      }
      if (detail === 'Reminder with this time already exists') {
        notice.error('Уже есть напоминание в это время');
        return;
      }

      notice.error(detail || 'Ошибка при создании напоминания');
    },
  });
};

export const useUpdateReminder = () => {
  return useMutation({
    mutationFn: ({ reminderId, data }: UpdateReminderParams) =>
      updateReminder({ reminderId, data }),
    onSuccess: (response) => {
      queryClient.setQueryData<Reminder[]>(
        ['reminders', 'list', response.reminder.task_id],
        (old) => updateArrayItem(old, response.reminder),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', response.task.id] },
        (old) => updateInfiniteItem(old, response.task),
      );
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail;

      if (detail === 'Count of reminders must be equal or less than 5') {
        notice.error('Нельзя добавлять больше 5 напоминаний');
        return;
      }

      notice.error(detail || 'Ошибка при создании напоминания');
    },
  });
};

export const useDeleteReminder = () => {
  return useMutation({
    mutationFn: (reminderId: number) => deleteReminder(reminderId),
    onSuccess: (response) => {
      queryClient.setQueryData<Reminder[]>(
        ['reminders', 'list', response.reminder.task_id],
        (old) => removeArrayItem(old, response.reminder.id),
      );

      queryClient.setQueriesData<InfiniteData<GetTasksListResponce>>(
        { queryKey: ['tasks', 'list', response.task.id] },
        (old) => updateInfiniteItem(old, response.task),
      );
    },
    onError: () => {
      notice.error('Ошибка при удалении напоминания');
    },
  });
};
