import { useEffect } from 'react';

import { authManager, authService } from 'entities/user';
import { setInitialized } from 'entities/user/model/slice/authSlice';
import { apiClient } from 'shared/api';

import { useAppDispatch } from '../providers/store/hooks/useAppDispatch';

export const useInitializeApp = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initialize = async () => {
      const token = authService.getToken();

      if (!token) {
        dispatch(setInitialized());
        return;
      }

      try {
        const { data } = await apiClient.post('/auth/refresh');

        authManager.login(data.access_token, dispatch);
      } catch {
        authManager.logout(dispatch);
      } finally {
        dispatch(setInitialized());
      }
    };

    initialize();
  }, [dispatch]);
};
