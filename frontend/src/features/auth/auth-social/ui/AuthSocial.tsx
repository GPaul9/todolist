import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import GitlabIcon from 'assets/gitlab-icon.svg?react';
import GoogleIcon from 'assets/google-icon.svg?react';
import { notice } from 'shared/ui';

import { authSocial } from '../model/authSocial';
import { authSocialProviders } from '../model/types';
import { useGitLabAuth } from '../model/useGitLabAuth';
import { useGoogleAuth } from '../model/useGoogleAuth';

import styles from './AuthSocial.module.scss';
import { AuthSocialBtn } from './AuthSocialBtn';

export const AuthSocial = () => {
  const [searchParams] = useSearchParams();
  const { mutate: gitlabMutate } = useGitLabAuth();
  const { mutate: googleMutate } = useGoogleAuth();
  const isAuthStarted = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (code && !isAuthStarted.current) {
      isAuthStarted.current = true;
      if (window.location.pathname.includes('google')) {
        googleMutate(code);
      } else {
        gitlabMutate(code);
      }
    }
  }, [searchParams, gitlabMutate, googleMutate]);

  const handleAuth = async (provider: authSocialProviders) => {
    try {
      await authSocial(provider);
    } catch {
      notice.error('Ошибка авторизации');
    }
  };

  return (
    <div className={styles.social}>
      <AuthSocialBtn
        title="Войти с Google"
        icon={<GoogleIcon />}
        onClick={() => handleAuth('google')}
      />

      <AuthSocialBtn
        title="Войти с GitLab"
        icon={<GitlabIcon />}
        onClick={() => handleAuth('gitlab')}
      />
    </div>
  );
};
