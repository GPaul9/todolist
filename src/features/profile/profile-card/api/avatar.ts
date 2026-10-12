import { apiClient } from 'shared/api';

export const uploadAvatar = async (file: File): Promise<{ avatar_path: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.patch<{ avatar_path: string }>('profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAvatar = async (): Promise<void> => {
  await apiClient.delete('/profile/avatar');
};
