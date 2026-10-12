import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from 'app/providers/store/hooks/useAppDispatch';
import { authManager } from 'entities/user';
import { notice } from 'shared/ui';

import { logoutRequest, logoutSecurity } from '../api/logout';

export const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: () => logoutRequest(),
    onSuccess: () => {
      authManager.logout(dispatch);
      navigate('/auth');
    },
  });
};

export const useLogoutSecurity = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (token: string) => logoutSecurity(token),
    onSuccess: () => {
      authManager.logout(dispatch);
      notice.success('Все активные сессии успешно завершены!');
      navigate('/auth', { replace: true });
    },

    onError: () => {
      notice.error('Ошибка! Не удалось завершить активные сессии');
      navigate('/auth', { replace: true });
    },
  });
};
