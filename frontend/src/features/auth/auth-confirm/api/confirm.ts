import { apiClient } from 'shared/api';

import { ConfirmResponse, VerifyConfirmData } from '../model/types';

export const resendRequest = async (email: string): Promise<ConfirmResponse> => {
  const response = await apiClient.post<ConfirmResponse>('/auth/send-verification-email', { email });

  return response.data;
};

export const verifyEmailRequest = async (data: VerifyConfirmData): Promise<ConfirmResponse> => {
  const response = await apiClient.post<ConfirmResponse>(`/auth/confirm/verify`, data);

  return response.data;
};
