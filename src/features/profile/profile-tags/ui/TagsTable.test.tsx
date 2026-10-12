import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useDeleteTag } from 'entities/tag';
import { useDialog } from 'shared/lib';

import { TagsTable } from './TagsTable';

jest.mock('entities/tag', () => ({
  ...jest.requireActual('entities/tag'),
  useDeleteTag: jest.fn(),
}));
jest.mock('shared/lib/dialog/useDialog');

jest.mock('./EditTagModal', () => ({
  EditTagModal: ({ isOpen, initialTag }: any) =>
    isOpen ? <div data-testid="edit-modal">Editing {initialTag?.name}</div> : null,
}));

describe('TagsTable', () => {
  const mockDelete = jest.fn();
  const mockConfirm = jest.fn();
  const user = userEvent.setup();

  const mockItems = [
    { id: 1, name: 'Срочно', color: '#ff0000', task_count: 0 },
    { id: 2, name: 'Позже', color: '#0000ff', task_count: 5 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useDeleteTag as jest.Mock).mockReturnValue({ mutate: mockDelete });
    (useDialog as jest.Mock).mockReturnValue({ confirm: mockConfirm });

    if (!document.getElementById('modal-root')) {
      const modalRoot = document.createElement('div');
      modalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(modalRoot);
    }
  });

  test('рендерит все переданные теги', () => {
    render(<TagsTable items={mockItems} />);
    expect(screen.getByText('Срочно')).toBeInTheDocument();
    expect(screen.getByText('Позже')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('открывает модалку редактирования при клике', async () => {
    render(<TagsTable items={mockItems} />);
    const editBtns = screen.getAllByLabelText(/Редактировать тег/i);

    await user.click(editBtns[0]);

    expect(screen.getByTestId('edit-modal')).toHaveTextContent('Editing Срочно');
  });

  test('удаляет тег сразу, если task_count === 0', async () => {
    render(<TagsTable items={mockItems} />);
    const deleteBtns = screen.getAllByLabelText(/Удалить тег/i);

    await user.click(deleteBtns[0]);

    expect(mockDelete).toHaveBeenCalledWith(1);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  test('запрашивает подтверждение, если task_count > 0', async () => {
    mockConfirm.mockResolvedValue(true);
    render(<TagsTable items={mockItems} />);
    const deleteBtns = screen.getAllByLabelText(/Удалить тег/i);

    await user.click(deleteBtns[1]);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(2);
    });
  });

  test('не вызывает удаление, если пользователь отменил диалог', async () => {
    mockConfirm.mockResolvedValue(false);
    render(<TagsTable items={mockItems} />);
    const deleteBtns = screen.getAllByLabelText(/Удалить тег/i);

    await user.click(deleteBtns[1]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
