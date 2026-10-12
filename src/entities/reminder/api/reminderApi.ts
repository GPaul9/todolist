import { Task } from 'entities/task';
import { apiClient } from 'shared/api';

import { Reminder } from '../model/types/reminder';

export type ReminderResponse = {
  reminder: Reminder;
  task: Task;
};

// getReminder
export const getReminders = async (taskId: number): Promise<Reminder[]> => {
  const response = await apiClient.get<Reminder[]>(`/tasks/${taskId}/reminders`);

  return response.data;
};

// createReminder
export type CreateReminderParams = {
  taskId: number;
  data: Pick<Reminder, 'reminder_at'>;
};

export const createReminder = async ({
  taskId,
  data,
}: CreateReminderParams): Promise<ReminderResponse> => {
  const response = await apiClient.post<ReminderResponse>(`/tasks/${taskId}/reminders`, data);

  return response.data;
};

// updateReminder
export type UpdateReminderParams = {
  reminderId: number;
  data: Partial<Pick<Reminder, 'reminder_at'>>;
};

export const updateReminder = async ({
  reminderId,
  data,
}: UpdateReminderParams): Promise<ReminderResponse> => {
  const response = await apiClient.patch<ReminderResponse>(`/reminders/${reminderId}`, data);

  return response.data;
};

// deleteReminder
export const deleteReminder = async (reminderId: number): Promise<ReminderResponse> => {
  const response = await apiClient.delete<ReminderResponse>(`/reminders/${reminderId}`);

  return response.data;
};
