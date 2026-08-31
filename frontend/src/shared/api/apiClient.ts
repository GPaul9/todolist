import axios from 'axios';
import qs from 'qs';

import { store } from 'app/providers/store/store';
import { authManager } from 'entities/user/model/authManager';
import { authService } from 'entities/user/model/authService';

export const BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});

apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest.url?.includes('/auth/applogin') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (isAuthRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');

        authService.setToken(data.access_token);

        originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        authManager.logout(store.dispatch);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const apiClientPublic = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});
