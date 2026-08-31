export type ReminderStatus = 'pending' | 'processing' | 'sent' | 'canceled';

export type Reminder = {
  id: number;
  status: ReminderStatus;
  reminder_at: string;
  task_id: number;
};
