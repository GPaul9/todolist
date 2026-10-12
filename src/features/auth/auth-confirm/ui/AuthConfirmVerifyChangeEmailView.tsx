import { Navigate } from 'react-router-dom';

import { PageLoader } from 'shared/ui';

import { useAuthConfirmVerify } from '../model/useAuthConfirmVerify';

import { AuthConfirmVerifyChangeEmailFaild } from './screens/AuthConfirmVerifyChangeEmailFaild';
import { AuthConfirmVerifyChangeEmailSuccess } from './screens/AuthConfirmVerifyChangeEmailSuccess';

const AuthConfirmVerifyChangeEmailView = () => {
  const { token, isLoading, isError, isSuccess } = useAuthConfirmVerify();

  if (!token) return <Navigate to="/auth" replace />;

  if (isLoading) return <PageLoader />;

  if (isSuccess) {
    return <AuthConfirmVerifyChangeEmailSuccess />;
  }

  if (isError) {
    return <AuthConfirmVerifyChangeEmailFaild />;
  }

  return null;
};

export default AuthConfirmVerifyChangeEmailView;
