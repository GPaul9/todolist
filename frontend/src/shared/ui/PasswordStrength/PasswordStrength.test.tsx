import { render, screen } from '@testing-library/react';

import { PasswordStrength } from './PasswordStrength';

describe('PasswordStrength component', () => {
  it('Рендерит низкую надежность при score <= 2', () => {
    render(<PasswordStrength score={2} onlyText />);
    expect(screen.getByText(/Низкая/i)).toBeInTheDocument();
  });

  it('Рендерит высокую надежность при score > 5', () => {
    render(<PasswordStrength score={6} onlyText />);
    expect(screen.getByText(/Высокая/i)).toBeInTheDocument();
  });

  it('В режиме onlyBar отрисовывает правильное количество активных сегментов', () => {
    const { container } = render(<PasswordStrength score={4} onlyBar />);

    const activeSegments = container.querySelectorAll('.activeYellow');
    expect(activeSegments.length).toBe(4);
  });

  it('Не рендерит ничего, если не переданы флаги onlyBar или onlyText', () => {
    const { container } = render(<PasswordStrength score={3} />);
    expect(container.firstChild).toBeNull();
  });
});
