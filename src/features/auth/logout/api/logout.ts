import { apiClient } from 'shared/api';

export const logoutRequest = async (): Promise<string> => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const logoutSecurity = async (token: string): Promise<string> => {
  const response = await apiClient.post('/auth/security/logout', { token: token });
  return response.data;
};
