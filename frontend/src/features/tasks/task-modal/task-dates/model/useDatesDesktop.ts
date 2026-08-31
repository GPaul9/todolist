import { Task } from 'entities/task';
import { useGetReminders, useReminderActions } from 'entities/reminder';
import { useMe } from 'entities/user';

interface TProps {
  task: Task;
  disabled?: boolean;
}

export const useDatesDesktop = ({ task, disabled = false }: TProps) => {
  const { data: reminders = [], isLoading } = useGetReminders(task.id);
  const { actions, isPending } = useReminderActions();
  const { data: user } = useMe();

  const currentReminder = reminders[0];

  const handleReminderSave = async (newDate: string) => {
    if (disabled) return;
    await actions.create({
      taskId: task.id,
      data: { reminder_at: newDate },
    });
  };

  const handleReminderDelete = async (e: React.MouseEvent, reminderId: number) => {
    e.stopPropagation();
    if (disabled) return;
    await actions.delete(reminderId);
  };

  return {
    reminders,
    isLoading,
    isPending,
    currentReminder,
    handleReminderSave,
    handleReminderDelete,
  };
};
