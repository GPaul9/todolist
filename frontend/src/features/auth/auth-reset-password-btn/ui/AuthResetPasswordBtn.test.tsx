import { render, screen, fireEvent } from '@testing-library/react';

import { AuthResetPasswordBtn } from './AuthResetPasswordBtn';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('AuthResetPasswordBtn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<AuthResetPasswordBtn />);
  });

  it('Рендерит текст и кнопку сброса пароля', () => {
    expect(screen.getByText(/Забыли пароль\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Нажмите, чтобы сбросить/i })).toBeInTheDocument();
  });

  it('Перенаправляет на страницу сброса при клике', () => {
    fireEvent.click(screen.getByRole('button'));

    expect(mockedNavigate).toHaveBeenCalledWith('reset');
  });
});
