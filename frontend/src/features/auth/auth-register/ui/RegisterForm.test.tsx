import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useRegisterForm } from '../model/useRegisterForm';

import { RegisterForm } from './RegisterForm';

jest.mock('../model/useRegisterForm');

describe('RegisterForm', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRegisterForm as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<RegisterForm />);
  });

  it('Рендерит форму с полями', () => {
    const nameInput = screen.getByPlaceholderText('Имя');
    const lastNameInput = screen.getByPlaceholderText('Фамилия');
    const emailInput = screen.getByPlaceholderText('Адрес электронной почты');
    const passwordInput = screen.getByLabelText('Пароль');
    const repeatPasswordInput = screen.getByLabelText('Повторить пароль');
    const checkDataInput = screen.getByText(/Согласен на обработку данных/i);
    const checkPolicyInput = screen.getByText(/Согласен с/i);
    const submitBtn = screen.getByRole('button', { name: /Зарегистрироваться/i });

    expect(nameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(repeatPasswordInput).toBeInTheDocument();
    expect(checkDataInput).toBeInTheDocument();
    expect(checkPolicyInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
  });

  test('Показывает ошибку если email уже существует', async () => {
    mockMutate.mockImplementation((_data, options) => {
      options.onError({
        response: {
          status: 409,
          data: {
            detail: 'User already exists',
          },
        },
      });
    });

    await userEvent.type(screen.getByLabelText(/Имя/i), 'Имя');
    await userEvent.type(screen.getByLabelText(/Фамилия/i), 'Фамилия');
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@mail.ru');
    await userEvent.type(screen.getByLabelText(/^Пароль$/i), 'Password1234!');
    await userEvent.type(screen.getByLabelText(/Повторить пароль/i), 'Password1234!');
    await userEvent.click(screen.getByLabelText(/Согласен на обработку данных/i));
    await userEvent.click(screen.getByLabelText(/Согласен с/i));

    await userEvent.click(screen.getByRole('button', { name: /Зарегистрироваться/i }));

    expect(mockMutate).toHaveBeenCalled();

    await waitFor(() =>
      expect(screen.getByText(/Пользователь с таким email уже существует/i)).toBeInTheDocument(),
    );
  });
});
