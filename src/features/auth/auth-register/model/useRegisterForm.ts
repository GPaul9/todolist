import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { registerRequest } from '../api/register';

import { RegisterFormData } from './types';

export const useRegisterForm = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterFormData) => registerRequest(data),
    onSuccess: (_, variables) => {
      navigate('/auth/confirm', { state: { email: variables.email }, replace: true });
    },
  });
};
