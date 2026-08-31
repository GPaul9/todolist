import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Input } from './Input';

describe('Input component', () => {
  it('Рендерит label и placeholder', () => {
    render(<Input label="Email" placeholder="Введите email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите email')).toBeInTheDocument();
  });

  it('Показывает helpText только при фокусе', () => {
    render(<Input helpText="Минимум 8 символов" />);

    expect(screen.queryByText('Минимум 8 символов')).not.toBeInTheDocument();

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText('Минимум 8 символов')).toBeInTheDocument();
  });

  it('Показывает errorMessage и скрывает helpText при ошибке', () => {
    render(<Input status="error" errorMessage="Ошибка!" helpText="Подсказка" />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText('Ошибка!')).toBeInTheDocument();
    expect(screen.queryByText('Подсказка')).not.toBeInTheDocument();
  });

  it('Правильно прокидывает ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
