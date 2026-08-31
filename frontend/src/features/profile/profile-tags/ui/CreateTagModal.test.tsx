import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCreateTag } from 'entities/tag';

import { CreateTagModal } from './CreateTagModal';

jest.mock('entities/tag', () => ({
  ...jest.requireActual('entities/tag'),
  useCreateTag: jest.fn(),
}));

describe('CreateTagModal', () => {
  const mockCreateTag = jest.fn();
  const mockOnClose = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    (useCreateTag as jest.Mock).mockReturnValue({
      mutateAsync: mockCreateTag,
      isPending: false,
    });

    if (!document.getElementById('modal-root')) {
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
    }
  });

  it('Кнопка "Сохранить изменения" заблокирована при пустом названии', async () => {
    render(<CreateTagModal isOpen={true} onClose={mockOnClose} />);

    const submitBtn = screen.getByRole('button', { name: /Сохранить изменения/i });
    expect(submitBtn).toBeDisabled();
  });

  it('Показывает ошибку, если название ввели и стерли', async () => {
    render(<CreateTagModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/Название тэга/i);

    await user.type(input, 'Тест');
    await user.clear(input);

    await waitFor(() => {
      expect(screen.getByText(/Введите название/i)).toBeInTheDocument();
    });
  });

  it('Вызывает mutateAsync (createTag) при успешном заполнении', async () => {
    render(<CreateTagModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/Название тэга/i);
    const submitBtn = screen.getByRole('button', { name: /Сохранить изменения/i });

    await user.type(input, 'Новый тег');

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    await user.click(submitBtn);

    expect(mockCreateTag).toHaveBeenCalledWith(expect.objectContaining({ name: 'Новый тег' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('Кнопка "Добавить еще" вызывает мутацию и не закрывает модалку', async () => {
    render(<CreateTagModal isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/Название тэга/i);
    const addMoreBtn = screen.getByRole('button', { name: /Добавить еще/i });

    await user.type(input, 'Первый тег');
    await user.click(addMoreBtn);

    expect(mockCreateTag).toHaveBeenCalledWith(expect.objectContaining({ name: 'Первый тег' }));

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(input).toHaveValue('');
  });
});
