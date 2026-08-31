import { Navigate } from 'react-router-dom';

import { PageLoader } from 'shared/ui';

import { useAuthConfirmVerify } from '../model/useAuthConfirmVerify';

import { AuthConfirmVerifyFaild } from './screens/AuthConfirmVerifyFaild';
import { AuthConfirmVerifySuccess } from './screens/AuthConfirmVerifySuccess';

const AuthConfirmVerifyView = () => {
  const { token, isLoading, isError, isSuccess } = useAuthConfirmVerify();

  if (!token) return <Navigate to="/auth" replace />;

  if (isLoading) return <PageLoader />;

  if (isSuccess) {
    return <AuthConfirmVerifySuccess />;
  }

  if (isError) {
    return <AuthConfirmVerifyFaild />;
  }

  return null;
};

export default AuthConfirmVerifyView;
