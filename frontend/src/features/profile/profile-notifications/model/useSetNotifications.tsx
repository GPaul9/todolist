import { useMutation, useQueryClient } from '@tanstack/react-query';

import { User } from 'entities/user';
import { updateUser } from 'entities/user/api/userApi';
import { notice } from 'shared/ui';

export const useSetNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,

    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData<User>(['profile']);
      queryClient.setQueryData(['profile'], (old: User | undefined) => {
        if (!old) return old;
        return { ...old, ...newSettings };
      });
      return { previousProfile };
    },

    onError: (err: any, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }

      if (!window.navigator.onLine || !err.response) {
        notice.error('Ошибка сети. Проверьте подключение к интернету');
        return;
      }

      notice.error('Не удалось сохранить настройки');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
