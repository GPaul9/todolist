import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { PageLoader } from 'shared/ui';

import { useLogoutSecurity } from '../model/useLogout';

const LogoutSecurity = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { mutate, isPending } = useLogoutSecurity();

  useEffect(() => {
    if (token) {
      mutate(token);
    }
  }, [token, mutate]);

  if (!token) {
    return <Navigate to="/project" replace />;
  }

  if (isPending) {
    return <PageLoader />;
  }

  return null;
};

export default LogoutSecurity;
