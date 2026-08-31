import { useMutation } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { AuthResetRequest } from './AuthResetRequest';

jest.mock('@tanstack/react-query');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('AuthResetRequest', () => {
  const mockMutate = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  test('Отправляет email и делает navigate при успехе', async () => {
    const mockNavigate = jest.fn();

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: (email: string) => {
        onSuccess(null, email);
      },
      isPending: false,
    }));

    render(
      <MemoryRouter>
        <AuthResetRequest />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText(/Почта/i), 'test@mail.ru');

    const button = screen.getByRole('button', { name: /Получить ссылку/i });

    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('sent', {
      state: { email: 'test@mail.ru' },
      replace: true,
    });
  });
});
