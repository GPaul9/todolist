import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { authSlice } from 'entities/user';

import { loginRequest } from '../api/login';

import { useLoginForm } from './useLoginForm';

jest.mock('../api/login');

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

const mockedDispatch = jest.fn();
jest.mock('app/providers/store/hooks/useAppDispatch', () => ({
  useAppDispatch: () => mockedDispatch,
}));

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Успешный логин: сохраняет токен, инвалидирует кэш, диспатчит и переходит по навигации', async () => {
    (loginRequest as jest.Mock).mockResolvedValue({
      access_token: 'token123',
      token_type: 'bearer',
    });

    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useLoginForm(), { wrapper });

    act(() => {
      result.current.mutate({ email: 'test@mail.ru', password: '123456789' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(localStorage.getItem('accessToken')).toBe('token123');
    expect(mockedDispatch).toHaveBeenCalledWith(authSlice.actions.setAuth());
    expect(mockedNavigate).toHaveBeenCalledWith('/project');
  });
});
