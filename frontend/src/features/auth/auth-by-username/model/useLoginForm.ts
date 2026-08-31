import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from 'app/providers/store/hooks/useAppDispatch';
import { authManager } from 'entities/user';

import { loginRequest } from '../api/login';

import { LoginFormData, LoginResponse } from './types';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: LoginFormData) => loginRequest(data),
    onSuccess: async (data: LoginResponse) => {
      authManager.login(data.access_token, dispatch);
      navigate('/project');
    },
  });
};
