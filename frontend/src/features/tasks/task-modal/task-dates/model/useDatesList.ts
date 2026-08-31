import dayjs from 'dayjs';
import { useState } from 'react';
import { useGetReminders, useReminderActions } from 'entities/reminder';

import { Task, useTaskActions } from 'entities/task';

interface TProps {
  task: Task;
  mode: 'deadline' | 'reminder';
  onClose: () => void;
  disabled?: boolean;
}

export const useDatesList = ({ task, mode, onClose, disabled }: TProps) => {
  const { actions: taskActions, isPending: isTaskPending } = useTaskActions();
  const { actions: reminderActions, isPending: isReminderPending } = useReminderActions();
  const { data: reminders = [] } = useGetReminders(task.id);


  const [step, setStep] = useState<'list' | 'calendar' | 'time'>('list');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editReminder, setEditReminder] = useState<number | null>(null);


  const isSaving = isTaskPending.update || isReminderPending.create;


  const handleHeaderClose = () => {
    if (step === 'time') setStep('calendar');
    else if (step === 'calendar') setStep('list');
    else onClose();
  };

  const handleFinalSave = async (timeString: string) => {
    if (disabled) return;
    const isToday = selectedDate === dayjs().format('YYYY-MM-DD');
    const currentTime = dayjs().format('HH:mm');

    const isPastTime =
      isToday &&
      (() => {
        const [h1, m1] = timeString.split(':').map(Number);
        const [h2, m2] = currentTime.split(':').map(Number);
        return h1 < h2 || (h1 === h2 && m1 < m2);
      })();

    if (mode === 'reminder' && isPastTime) return;

    const isoDateTime = dayjs(`${selectedDate}T${timeString}`).toISOString();

    try {
      if (mode === 'deadline') {
        await taskActions.update({ taskId: task.id, data: { deadline: isoDateTime } });
      } else {
        if (editReminder !== null && editReminder !== undefined) {
          await reminderActions.update({
            reminderId: editReminder,
            data: { reminder_at: isoDateTime, task_id: task.id },
          });
        } else {
          await reminderActions.create({
            taskId: task.id,
            data: { reminder_at: isoDateTime },
          });
        }
      }
      setEditReminder(null);
      setStep('list');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  const handleEditClick = (initialIsoString?: string | null, reminderId: number | null = null) => {
    if (disabled) return;
    if (initialIsoString) {
      setSelectedDate(dayjs(initialIsoString).format('YYYY-MM-DD'));
    } else {
      setSelectedDate('');
    }

    setEditReminder(reminderId);
    setStep('calendar');
  };

  const handleDelete = (id: number) => {
    if (disabled) return;
    reminderActions.delete(id);
  };

  return {
    step,
    setStep,
    selectedDate,
    setSelectedDate,
    reminders,
    isSaving,
    isReminderPending,
    handleHeaderClose,
    handleFinalSave,
    handleEditClick,
    handleDelete,
  };
};
