import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { notice } from '../ui/Notice/Notice';
import { TNotice } from '../ui/Notice/noticeTypes';

export type RouteNoticeState = {
  notice?: {
    type: Extract<TNotice, 'success' | 'error'>;
    message: string;
  };
};

export const useRouteNotice = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as RouteNoticeState | null;

    if (!state?.notice) return;

    const { type, message } = state.notice;

    notice[type](message);

    navigate(location.pathname, { replace: true });
  }, [location, navigate]);
};
