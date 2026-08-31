import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from 'app/providers/store/hooks/useAppDispatch';
import { authManager } from 'entities/user';

import { googleCallbackRequest } from './authSocial';

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (code: string) => googleCallbackRequest(code),
    onSuccess: async (data) => {
      if (!data.access_token) return;

      authManager.login(data.access_token, dispatch);
      navigate('/project');
    },
  });
};
