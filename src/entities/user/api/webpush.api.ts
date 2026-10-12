import { apiClient } from 'shared/api';

export type WebpushKeys = {
  p256dh: string;
  auth: string;
};

export type WebpushRegisterPayload = {
  endpoint: string;
  keys: WebpushKeys;
};

export const webpushApi = {
  register: async (payload: WebpushRegisterPayload) => {
    const response = await apiClient.post('/webpush/register', payload);
    return response.data;
  },
};
