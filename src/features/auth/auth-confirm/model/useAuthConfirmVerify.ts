import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { verifyEmailRequest } from '../api/confirm';

export const useAuthConfirmVerify = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { isLoading, isError, isSuccess } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => verifyEmailRequest({ token: token! }),
    retry: false,
    enabled: !!token,
  });

  return { token, isLoading, isError, isSuccess };
};
