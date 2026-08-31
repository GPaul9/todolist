import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from 'app/providers/queryClient';
import { notice } from 'shared/ui';

import { getUser, updateUser, UpdateUserParams } from '../../api/userApi';
import { User } from '../types/user';

export const useMe = () => {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: getUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: (data: UpdateUserParams) => updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notice.success('Профиль успешно обновлён');
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        return;
      }

      if (!window.navigator.onLine || !error.response) {
        notice.error('Ошибка сети. Проверьте подключение к интернету');
        return;
      }

      const message = error.response?.data?.detail || 'Ошибка при обновлении профиля';
      notice.error(message);
    },
  });
};
