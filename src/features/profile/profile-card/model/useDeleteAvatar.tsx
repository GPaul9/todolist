import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notice } from 'shared/ui';

import { deleteAvatar } from '../api/avatar';

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notice.success('Аватар успешно удалён');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Ошибка приудалении аватара';
      notice.error(message);
    },
  });
};
