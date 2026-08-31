import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useMe, useUpdateUser } from 'entities/user';

import { ProfileNames } from './ProfileNames';

jest.mock('entities/user/model/hooks/useUserApi');

describe('ProfileNames', () => {
  const mockMutate = jest.fn();
  const user = userEvent.setup();

  const mockUserData = {
    first_name: 'Иван',
    last_name: 'Иванов',
    email: 'test@mail.ru',
    avatar_path: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMe as jest.Mock).mockReturnValue({ data: mockUserData });
    (useUpdateUser as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('Корректно подставляет начальные данные пользователя', () => {
    render(<ProfileNames />);

    expect(screen.getByLabelText(/Имя/i)).toHaveValue('Иван');
    expect(screen.getByLabelText(/Фамилия/i)).toHaveValue('Иванов');
  });

  it('Кнопка "Сохранить" заблокирована без изменений', () => {
    render(<ProfileNames />);
    const saveBtn = screen.getByRole('button', { name: /Сохранить/i });
    expect(saveBtn).toBeDisabled();
  });

  it('Показывает ошибки валидации при пустых полях', async () => {
    render(<ProfileNames />);
    const nameInput = screen.getByLabelText(/Имя/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'A');
    await user.keyboard('{Backspace}');

    await waitFor(() => {
      expect(screen.getByText(/Пожалуйста, заполните все обязательные поля/i)).toBeInTheDocument();
    });
  });

  it('Вызывает mutate с полным объектом данных при сохранении', async () => {
    render(<ProfileNames />);
    const nameInput = screen.getByLabelText(/Имя/i);
    const saveBtn = screen.getByRole('button', { name: /Сохранить/i });

    await user.clear(nameInput);
    await user.type(nameInput, 'Петр');

    await waitFor(() => expect(saveBtn).not.toBeDisabled());
    await user.click(saveBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Петр',
        last_name: 'Иванов',
        email: 'test@mail.ru',
      }),
    );
  });

  it('Показывает лоадер на кнопке во время отправки', () => {
    (useUpdateUser as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<ProfileNames />);
    const saveBtn = screen.getByRole('button', { name: /Сохранить/i });

    expect(saveBtn).toBeDisabled();
  });
});
