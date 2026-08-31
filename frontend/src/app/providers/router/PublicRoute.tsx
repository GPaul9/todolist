import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from 'app/providers/store/hooks/useAppDispatch';
import { PageLoader } from 'shared/ui';

export const PublicRoute = () => {
  const { isAuth, isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (isAuth) {
    return <Navigate to="/project" replace />;
  }

  return <Outlet />;
};
