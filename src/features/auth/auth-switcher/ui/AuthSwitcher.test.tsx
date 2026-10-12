import { render, screen, fireEvent } from '@testing-library/react';
import { useMediaQuery } from 'react-responsive';

import { AuthSwitcher } from './AuthSwitcher';

jest.mock('react-responsive');

describe('AuthSwitcher', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  it('Рендерит полный текст на десктопе', () => {
    render(<AuthSwitcher mode="login" onChange={mockOnChange} />);
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
  });

  it('Рендерит сокращенный текст на мобильных устройствах', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    render(<AuthSwitcher mode="login" onChange={mockOnChange} />);
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });

  it('Вызывает onChange с правильным режимом при клике', () => {
    render(<AuthSwitcher mode="login" onChange={mockOnChange} />);

    const regBtn = screen.getByText('Зарегистрироваться');
    fireEvent.click(regBtn);

    expect(mockOnChange).toHaveBeenCalledWith('register');
  });
});
