import { apiClient } from 'shared/api';

import { RegisterResponse, RegisterFormData } from '../model/types';

export const registerRequest = async (data: RegisterFormData): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
};
