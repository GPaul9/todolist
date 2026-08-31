import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useMe } from 'entities/user';
import { useDialog } from 'shared/lib';

import { useDeleteAvatar } from '../model/useDeleteAvatar';
import { useUploadAvatar } from '../model/useUpdateAvatar';

import { ProfileCard } from './ProfileCard';

jest.mock('entities/user/hooks/useMe');
jest.mock('shared/lib/dialog/useDialog');
jest.mock('./model/useDeleteAvatar');
jest.mock('./model/useUpdateAvatar');

describe('ProfileCard', () => {
  const mockDelete = jest.fn();
  const mockUpload = jest.fn();
  const mockConfirm = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMe as jest.Mock).mockReturnValue({
      data: {
        id: 777,
        first_name: 'Анна',
        last_name: 'Попова',
        created_at: '2024-03-22T10:00:00Z',
        avatar_path: '/images/avatar.jpg',
      },
    });

    (useDeleteAvatar as jest.Mock).mockReturnValue({ mutate: mockDelete, isPending: false });
    (useUploadAvatar as jest.Mock).mockReturnValue({ mutate: mockUpload, isPending: false });
    (useDialog as jest.Mock).mockReturnValue({ confirm: mockConfirm });
  });

  test('отображает полное имя пользователя и его ID', () => {
    render(<ProfileCard />);
    expect(screen.getByText(/Анна Попова/i)).toBeInTheDocument();
    expect(screen.getByText(/ID 777/i)).toBeInTheDocument();
  });

  test('вызывает подтверждение и deleteAvatar при клике на кнопку удаления', async () => {
    mockConfirm.mockResolvedValue(true);

    render(<ProfileCard />);
    const deleteBtn = screen.getByRole('button', { name: /Удалить фото/i });

    await user.click(deleteBtn);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalled();
  });

  test('не вызывает deleteAvatar, если пользователь отменил удаление', async () => {
    mockConfirm.mockResolvedValue(false);

    render(<ProfileCard />);
    const deleteBtn = screen.getByRole('button', { name: /Удалить фото/i });

    await user.click(deleteBtn);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  test('кнопка удаления заблокирована, если аватара нет', () => {
    (useMe as jest.Mock).mockReturnValue({
      data: { avatar_path: null, id: 777 },
    });

    render(<ProfileCard />);
    const deleteBtn = screen.getByRole('button', { name: /Удалить фото/i });

    expect(deleteBtn).toBeDisabled();
  });

  test('вызывает uploadAvatar при выборе файла', async () => {
    const { container } = render(<ProfileCard />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    await user.upload(fileInput, file);

    expect(mockUpload).toHaveBeenCalledWith(file);
  });
});
