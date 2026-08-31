import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useMe, useUpdateUser } from 'entities/user';
import { useDialog } from 'shared/lib';

import { ProfileEmail } from './ProfileEmail';

jest.mock('entities/user/model/hooks/useUserApi');
jest.mock('shared/lib/dialog/useDialog');

describe('ProfileEmail', () => {
  const mockMutate = jest.fn();
  const mockAlert = jest.fn().mockResolvedValue(true);
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMe as jest.Mock).mockReturnValue({
      data: { email: 'old@mail.ru', first_name: 'Ivan', last_name: 'Ivanov', avatar_path: '' },
    });

    (useUpdateUser as jest.Mock).mockReturnValue({
      mutate: mockMutate.mockResolvedValue({}),
      isPending: false,
    });

    (useDialog as jest.Mock).mockReturnValue({
      alert: mockAlert,
    });
  });

  it('Показывает ошибку при вводе некорректного email', async () => {
    render(<ProfileEmail />);
    const input = screen.getByLabelText(/Email/i);

    await user.clear(input);
    await user.type(input, 'invalid-email');

    await waitFor(() => {
      expect(
        screen.queryByText(/Проверьте введенные данные/i) ||
          screen.queryByText(/Некорректный email/i),
      ).toBeInTheDocument();
    });
  });

  it('Вызывает mutate при успешном заполнении и показывает диалог', async () => {
    render(<ProfileEmail />);
    const input = screen.getByLabelText(/Email/i);
    const saveBtn = screen.getByRole('button', { name: /Сохранить/i });

    await user.clear(input);
    await user.type(input, 'new@mail.ru');

    await waitFor(() => {
      expect(saveBtn).not.toBeDisabled();
    });

    await user.click(saveBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@mail.ru',
        first_name: 'Ivan',
      }),
    );

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  it('Кнопка отмены сбрасывает значение к исходному', async () => {
    render(<ProfileEmail />);
    const input = screen.getByLabelText(/Email/i);

    await user.type(input, 'another@mail.ru');
    const cancelBtn = screen.getByRole('button', { name: /Отменить/i });

    await user.click(cancelBtn);

    expect(input).toHaveValue('old@mail.ru');
  });
});
