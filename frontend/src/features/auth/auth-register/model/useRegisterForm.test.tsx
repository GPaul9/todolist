import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { registerRequest } from '../api/register';

import { useRegisterForm } from './useRegisterForm';

jest.mock('../api/register');

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

describe('useRegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Успешная регистрация: переходит по навигации', async () => {
    (registerRequest as jest.Mock).mockResolvedValue({
      access_token: 'token123',
      token_type: 'bearer',
    });

    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useRegisterForm(), { wrapper });

    act(() => {
      result.current.mutate({
        first_name: 'name',
        last_name: 'last-name',
        email: 'test@mail.ru',
        password: '1234567890',
        repeat_password: '1234567890',
        consent_personal_data: true,
        privacy_policy_agreement: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedNavigate).toHaveBeenCalledWith('/auth/confirm', {
      state: { email: 'test@mail.ru' },
      replace: true,
    });
  });
});
