import { render, screen, fireEvent } from '@testing-library/react';

import { useGetTags } from 'entities/tag';

import { ProfileTags } from './ProfileTags';

jest.mock('entities/tag');
jest.mock('./TagsTable', () => ({
  TagsTable: ({ items }: { items: any[] }) => (
    <div data-testid="tags-table">
      {items.map((t) => (
        <span key={t.id}>{t.name}</span>
      ))}
    </div>
  ),
}));
jest.mock('./CreateTagModal', () => ({
  CreateTagModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-modal">Modal Open</div> : null,
}));

describe('ProfileTags Component', () => {
  const mockTags = [
    { id: 1, name: 'Работа', color: '#ff0000', task_count: 0 },
    { id: 2, name: 'Дом', color: '#00ff00', task_count: 2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает таблицу, если список тегов не пуст', () => {
    (useGetTags as jest.Mock).mockReturnValue({ data: mockTags });

    render(<ProfileTags />);

    expect(screen.getByTestId('tags-table')).toBeInTheDocument();
    expect(screen.getByText('Работа')).toBeInTheDocument();
    expect(screen.getByText('Дом')).toBeInTheDocument();
  });

  test('отображает заглушку, если список тегов пуст', () => {
    (useGetTags as jest.Mock).mockReturnValue({ data: [] });

    render(<ProfileTags />);

    expect(screen.getByText(/Создать тэг/i)).toBeInTheDocument();
    expect(screen.queryByTestId('tags-table')).not.toBeInTheDocument();
  });

  test('открывает модалку создания при клике на кнопку', () => {
    (useGetTags as jest.Mock).mockReturnValue({ data: [] });

    render(<ProfileTags />);

    const createBtn = screen.getByRole('button', { name: /Создать новый тэг/i });
    fireEvent.click(createBtn);

    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });
});
