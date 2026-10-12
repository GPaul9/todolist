import { apiClient } from 'shared/api';

import {
  ResetPasswordData,
  ResetPasswordResponse,
  ForgotPasswordResponse,
} from '../model/types/reset';

export const forgotPasswordRequest = async (email: string): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(`/auth/forgot-password`, {email})
  return response.data;
};

export const resetPasswordRequest = async (
  data: ResetPasswordData,
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(`/auth/reset/verify`, data);
  return response.data;
};
