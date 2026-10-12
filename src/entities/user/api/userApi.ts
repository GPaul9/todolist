import { apiClient } from 'shared/api';

import { User, UserSchema } from '../model/types/user';

export const getUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/profile');
  return UserSchema.parse(response.data);
};

export type UpdateUserParams = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  password?: string | null;
  new_password?: string | null;
  repeat_password?: string | null;
  is_email_verified?: boolean | null;
  avatar_path?: string | null;
  email_notifications?: boolean | null;
  webpush_notifications?: boolean | null;
};

export const updateUser = async (data: UpdateUserParams): Promise<User> => {
  const response = await apiClient.patch<User>('/profile', data);
  return UserSchema.parse(response.data);
};
