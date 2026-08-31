import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useUpdateTag } from 'entities/tag';

import { EditTagModal } from './EditTagModal';

jest.mock('entities/tag', () => ({
  ...jest.requireActual('entities/tag'),
  useUpdateTag: jest.fn(),
}));

describe('EditTagModal', () => {
  const mockUpdateTag = jest.fn();
  const mockOnClose = jest.fn();
  const user = userEvent.setup();

  const initialTag = {
    id: 10,
    name: 'Старый тег',
    color: '#994D65',
    task_count: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useUpdateTag as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateTag,
      isPending: false,
    });

    if (!document.getElementById('modal-root')) {
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
    }
  });

  it('Подставляет данные из initialTag в инпут при открытии', async () => {
    render(<EditTagModal isOpen={true} onClose={mockOnClose} initialTag={initialTag} />);

    const input = screen.getByPlaceholderText(/Название тэга/i) as HTMLInputElement;

    await waitFor(() => {
      expect(input.value).toBe('Старый тег');
    });
  });

  it('Блокирует кнопку "Сохранить", если имя очищено', async () => {
    render(<EditTagModal isOpen={true} onClose={mockOnClose} initialTag={initialTag} />);

    const input = screen.getByPlaceholderText(/Название тэга/i);
    const saveBtn = screen.getByRole('button', { name: /Сохранить изменения/i });

    await user.clear(input);

    await waitFor(() => {
      expect(saveBtn).toBeDisabled();
    });
  });

  it('Вызывает mutateAsync (updateTag) с измененными данными при сохранении', async () => {
    render(<EditTagModal isOpen={true} onClose={mockOnClose} initialTag={initialTag} />);

    const input = screen.getByPlaceholderText(/Название тэга/i);
    const saveBtn = screen.getByRole('button', { name: /Сохранить изменения/i });

    await user.clear(input);
    await user.type(input, 'Обновленный тег');

    await waitFor(() => expect(saveBtn).not.toBeDisabled());
    await user.click(saveBtn);

    expect(mockUpdateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        name: 'Обновленный тег',
        color: '#994D65',
      }),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('Кнопка "Отмена" закрывает модалку без вызова мутации', async () => {
    render(<EditTagModal isOpen={true} onClose={mockOnClose} initialTag={initialTag} />);

    const cancelBtn = screen.getByRole('button', { name: /Отмена/i });
    await user.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockUpdateTag).not.toHaveBeenCalled();
  });
});
