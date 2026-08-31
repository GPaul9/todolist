import { lazy, Suspense } from 'react';
import { useMediaQuery } from 'react-responsive';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { AuthConfirmFlow } from 'features/auth/auth-confirm';
import { AuthResetFlow } from 'features/auth/auth-reset';
import { PageLoader } from 'shared/ui';

import styles from './App.module.scss';
import { useInitializeApp } from './init/initializeApp';
import { PrivateRoute } from './providers/router/PrivateRoute';
import { PublicRoute } from './providers/router/PublicRoute';
import { useAppSelector } from './providers/store/hooks/useAppDispatch';
import { breakpoints } from './styles/breakpoints';

const AuthCard = lazy(() => import('features/auth/auth-card/ui/AuthCard'));
const AuthConfirmRequest = lazy(
  () => import('features/auth/auth-confirm/ui/screens/AuthConfirmRequest'),
);
const AuthConfirmVerifyView = lazy(
  () => import('features/auth/auth-confirm/ui/AuthConfirmVerifyView'),
);
const AuthConfirmVerifyChangeEmailView = lazy(
  () => import('features/auth/auth-confirm/ui/AuthConfirmVerifyChangeEmailView'),
);
const AuthResetRequest = lazy(() => import('features/auth/auth-reset/ui/screens/AuthResetRequest'));
const AuthResetVerifyView = lazy(() => import('features/auth/auth-reset/ui/AuthResetVerifyView'));
const AuthResetSentEmail = lazy(
  () => import('features/auth/auth-reset/ui/screens/AuthResetSentEmail'),
);
const LogoutSecurity = lazy(() => import('features/auth/logout/ui/LogoutSecurity'));

const AuthPage = lazy(() => import('pages/AuthPage/AuthPage'));
const ProfilePage = lazy(() => import('pages/ProfilePage/ProfilePage'));
const ProjectPage = lazy(() => import('pages/ProjectPage/ProjectPage'));
const ProjectBoardPage = lazy(() => import('pages/ProjectBoardPage/ProjectBoardPage'));
const ProjectBoardPageArchive = lazy(
  () => import('pages/ProjectBoardPageArchive/ProjectBoardPageArchive'),
);
const ArchivePage = lazy(() => import('pages/ArchivePage/ArchivePage'));
const NotFoundPage = lazy(() => import('pages/NotFoundPage/NotFoundPage'));

export function App() {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.md });
  const { isInitialized } = useAppSelector((state) => state.auth);

  useInitializeApp();

  if (!isInitialized) return <PageLoader />;

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to={'/project'} />} />

          <Route path="account/security" element={<LogoutSecurity />} />

          <Route path="/auth" element={<AuthPage />}>
            <Route path="confirm" element={<AuthConfirmFlow />}>
              <Route path="verify-email-change" element={<AuthConfirmVerifyChangeEmailView />} />
            </Route>
          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/auth" element={<AuthPage />}>
              <Route index element={<AuthCard />} />
              <Route path="gitlab/callback" element={<AuthCard />} />
              <Route path="google/callback" element={<AuthCard />} />

              <Route path="confirm" element={<AuthConfirmFlow />}>
                <Route index element={<AuthConfirmRequest />} />
                <Route path="verify" element={<AuthConfirmVerifyView />} />
              </Route>

              <Route path="reset" element={<AuthResetFlow />}>
                <Route index element={<AuthResetRequest />} />
                <Route path="verify" element={<AuthResetVerifyView />} />
                <Route path="sent" element={<AuthResetSentEmail />} />
              </Route>
            </Route>
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/project/:id" element={<ProjectBoardPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/project/:id/archive" element={<ProjectBoardPageArchive />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ToastContainer
          className={styles['toast-container']}
          position={isMobile ? 'top-center' : 'top-right'}
          newestOnTop
          limit={5}
        />
      </Suspense>
    </BrowserRouter>
  );
}
