import { render, screen, fireEvent } from '@testing-library/react';

import { AuthSocialBtn } from './AuthSocialBtn';

describe('AuthSocialBtn', () => {
  const mockOnClick = jest.fn();
  const title = 'Test Button';
  const icon = <span data-testid="test-icon" />;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Рендерит заголовок и иконку', () => {
    render(<AuthSocialBtn title={title} icon={icon} onClick={mockOnClick} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('Вызывает onClick при нажатии', () => {
    render(<AuthSocialBtn title={title} icon={icon} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
