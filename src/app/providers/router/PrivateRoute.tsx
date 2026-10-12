import { Navigate, Outlet } from 'react-router-dom';

import { PageLoader } from 'shared/ui';

import { useAppSelector } from '../store/hooks/useAppDispatch';

export const PrivateRoute = () => {
  const { isAuth, isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
