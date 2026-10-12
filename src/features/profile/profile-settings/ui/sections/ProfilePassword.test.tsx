import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useMe, useUpdateUser } from 'entities/user';

import { ProfilePassword } from './ProfilePassword';

jest.mock('entities/user/model/hooks/useUserApi');

describe('ProfilePassword', () => {
  const mockMutateAsync = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMe as jest.Mock).mockReturnValue({
      data: { first_name: 'Ivan', last_name: 'Ivanov', email: 'test@mail.ru', avatar_path: '' },
    });

    (useUpdateUser as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('По умолчанию отображает только кнопку "Изменить"', () => {
    render(<ProfilePassword />);
    expect(screen.getByText(/Сменить пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Изменить/i })).toBeInTheDocument();
  });

  it('Открывает форму при клике на "Изменить"', async () => {
    render(<ProfilePassword />);
    await user.click(screen.getByRole('button', { name: /Изменить/i }));

    expect(screen.getByLabelText(/Старый пароль/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Новый пароль/i)).toBeInTheDocument();
  });

  it('Кнопка Сохранить заблокирована, если пароль не соответствует требованиям силы', async () => {
    render(<ProfilePassword />);
    await user.click(screen.getByRole('button', { name: /Изменить/i }));

    const oldPassInput = screen.getByLabelText(/Старый пароль/i);
    const newPassInput = screen.getByLabelText(/Новый пароль/i);
    const saveBtn = screen.getByRole('button', { name: /Сохранить/i });

    await user.type(oldPassInput, 'currentPassword123');
    await user.type(newPassInput, 'weak');

    await waitFor(() => {
      expect(saveBtn).toBeDisabled();
    });
  });

  it('Закрывает форму и сбрасывает данные при клике на "Отменить"', async () => {
    render(<ProfilePassword />);
    await user.click(screen.getByRole('button', { name: /Изменить/i }));

    const cancelBtn = screen.getByRole('button', { name: /Отменить/i });
    await user.click(cancelBtn);

    expect(screen.queryByLabelText(/Старый пароль/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Изменить/i })).toBeInTheDocument();
  });

  it('Вызывает mutateAsync с полными данными пользователя и новыми паролями', async () => {
    render(<ProfilePassword />);
    await user.click(screen.getByRole('button', { name: /Изменить/i }));

    const oldPassInput = screen.getByLabelText(/Старый пароль/i);
    const newPassInput = screen.getByLabelText(/Новый пароль/i);
    const saveBtn = screen.getByRole('button', { name: /Сохранить/i });

    await user.type(oldPassInput, 'OldPass123!');
    await user.type(newPassInput, 'StrongPassword123!');

    await waitFor(() => expect(saveBtn).not.toBeDisabled());
    await user.click(saveBtn);

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'OldPass123!',
        new_password: 'StrongPassword123!',
        first_name: 'Ivan',
        email: 'test@mail.ru',
      }),
    );
  });
});
