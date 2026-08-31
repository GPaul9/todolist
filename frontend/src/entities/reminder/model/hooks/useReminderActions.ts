import { CreateReminderParams, UpdateReminderParams } from '../../api/reminderApi';

import { useCreateReminder, useDeleteReminder, useUpdateReminder } from './useReminderApi';

export type TypeReminderActions = ReturnType<typeof useReminderActions>['actions'];
export type TypeReminderPending = ReturnType<typeof useReminderActions>['isPending'];

export const useReminderActions = () => {
  const create = useCreateReminder();
  const update = useUpdateReminder();
  const deleteR = useDeleteReminder();

  const actions = {
    create: ({ taskId, data }: CreateReminderParams) => create.mutateAsync({ taskId, data }),
    update: ({ reminderId, data }: UpdateReminderParams) =>
      update.mutateAsync({ reminderId, data }),
    delete: (reminderId: number) => deleteR.mutateAsync(reminderId),
  };

  const isPending = {
    create: create.isPending,
    update: update.isPending,
    delete: deleteR.isPending,
  };

  const isAnyPending = Object.values(isPending).some(Boolean);

  return { actions, isPending, isAnyPending };
};
