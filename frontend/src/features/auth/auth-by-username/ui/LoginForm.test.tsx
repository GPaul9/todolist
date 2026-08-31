import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useLoginForm } from '../model/useLoginForm';

import { LoginForm } from './LoginForm';

jest.mock('../model/useLoginForm');

describe('LoginForm', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useLoginForm as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<LoginForm />);
  });

  it('Рендерит форму с полями email и пароль', () => {
    const emailInput = screen.getByPlaceholderText('Адрес электронной почты');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const submitBtn = screen.getByRole('button', { name: /Войти/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
  });

  it('Валидирует пустые поля и показывает ошибки', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(screen.getByText(/Введите email/i)).toBeInTheDocument();
      expect(screen.getByText(/Введите пароль/i)).toBeInTheDocument();
    });
  });

  it('Показывает ошибку 401', async () => {
    mockMutate.mockImplementation((_, { onError }) => {
      onError({ response: { status: 401 } });
    });

    const emailInput = screen.getByPlaceholderText('Адрес электронной почты');
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const submitBtn = screen.getByRole('button', { name: /Войти/i });

    await userEvent.type(emailInput, 'test@mail.ru');
    await userEvent.type(passwordInput, 'password');

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Неверный email или пароль/i).length).toBe(2);
    });
  });
});
