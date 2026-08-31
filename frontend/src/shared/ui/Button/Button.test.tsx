import { render, screen, fireEvent } from '@testing-library/react';

import { Button } from './Button';

describe('Button component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Рендерит текст внутри кнопки', () => {
    render(<Button>Нажми меня</Button>);
    expect(screen.getByText('Нажми меня')).toBeInTheDocument();
  });

  it('Блокирует кнопку и показывает лоадер при isLoading', () => {
    render(
      <Button isLoading onClick={mockOnClick}>
        Текст
      </Button>,
    );

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button.querySelector('.button__loader')).toBeInTheDocument();
  });

  it('Не вызывает onClick при нажатии в состоянии загрузки', () => {
    render(
      <Button isLoading onClick={mockOnClick}>
        Текст
      </Button>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('Пробрасывает стандартные HTML атрибуты (например, type)', () => {
    render(<Button type="submit">Отправить</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
