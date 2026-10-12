import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notice } from 'shared/ui';

import { uploadAvatar } from '../api/avatar';

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notice.success('Аватар успешно обновлен');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Ошибка при загрузке аватара';
      notice.error(message);
    },
  });
};
