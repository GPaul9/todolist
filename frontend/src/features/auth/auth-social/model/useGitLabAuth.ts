import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from 'app/providers/store/hooks/useAppDispatch';
import { authManager } from 'entities/user';

import { gitLabCallbackRequest } from '../model/authSocial';

export const useGitLabAuth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (code: string) => gitLabCallbackRequest(code),
    onSuccess: async (data) => {
      if (!data.access_token) {
        return;
      }

      authManager.login(data.access_token, dispatch);
      navigate('/project');
    },
  });
};
