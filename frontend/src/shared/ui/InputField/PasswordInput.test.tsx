import { render, screen, fireEvent } from '@testing-library/react';

import { PasswordInput } from './PasswordInput';

describe('PasswordInput component', () => {
  it('Изначально скрывает пароль (type="password")', () => {
    render(<PasswordInput placeholder="Введите пароль" />);

    const input = screen.getByPlaceholderText('Введите пароль');
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Показать пароль')).toBeInTheDocument();
  });

  it('Переключает тип на "text" при клике на иконку глаза', () => {
    render(<PasswordInput placeholder="Пароль" />);

    const toggleBtn = screen.getByLabelText('Показать пароль');
    const input = screen.getByPlaceholderText('Пароль');

    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Скрыть пароль')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Скрыть пароль'));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('Пробрасывает ошибку в базовый Input', () => {
    render(<PasswordInput errorMessage="Слишком короткий!" status="error" />);
    expect(screen.getByText('Слишком короткий!')).toBeInTheDocument();
  });
});
