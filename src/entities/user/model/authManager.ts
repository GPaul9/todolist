import { queryClient } from 'app/providers/queryClient';
import { AppDispatch } from 'app/providers/store/store';

import { setAuth, logout } from '../model/slice/authSlice';

import { authService } from './authService';

export const authManager = {
  login(token: string, dispatch: AppDispatch) {
    authService.setToken(token);

    dispatch(setAuth());
  },

  logout(dispatch: AppDispatch) {
    authService.removeToken();

    queryClient.removeQueries({ queryKey: ['profile'] });
    // queryClient.clear();

    dispatch(logout());
  },
};
