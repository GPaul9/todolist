import { renderHook } from '@testing-library/react';
import { useLocation, useNavigate } from 'react-router-dom';

import { notice } from '../ui/Notice/Notice';

import { useRouteNotice } from './useRouteNotice';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../ui/Notice/Notice', () => ({
  notice: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useRouteNotice', () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // ← важно
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
  });

  it('показывает уведомление из route state', () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/login',
      state: {
        notice: {
          type: 'success',
          message: 'Password updated',
        },
      },
    });

    renderHook(() => useRouteNotice());

    expect(notice.success).toHaveBeenCalledWith('Password updated');
    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('ничего не делает если notice отсутствует', () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/login',
      state: null,
    });

    renderHook(() => useRouteNotice());

    expect(notice.success).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
