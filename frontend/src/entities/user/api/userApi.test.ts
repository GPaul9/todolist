import { apiClient } from 'shared/api';

import { UserSchema } from '../model/types/user';

import { getUser, updateUser } from './userApi';

// Мокаем точно тот же модуль, откуда импортируем apiClient
jest.mock('shared/api/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('getUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Возвращает валидного пользователя', async () => {
    const mockResponse = {
      id: 123123,
      email: 'test@mail.ru',
      first_name: 'firstName',
      last_name: 'lastName',
      avatar_path: 'string',
      created_at: 'string',
      updated_at: 'string',
    };

    mockedApiClient.get.mockResolvedValue({ data: mockResponse });

    const result = await getUser();

    expect(UserSchema.safeParse(result).success).toBe(true);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/profile');
  });

  test('Выбрасывает ошибку при некорректных данных', async () => {
    mockedApiClient.get.mockResolvedValue({ data: { foo: 'bar' } });

    await expect(getUser()).rejects.toThrow();
  });
});

describe('updateUser API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отправляет данные на /profile и возвращает валидный объект пользователя', async () => {
    const updateData = { first_name: 'Петр', last_name: 'Петров', email: 'test@test.ru' };
    const mockUserResponse = {
      id: 1,
      email: 'test@test.ru',
      first_name: 'Петр',
      last_name: 'Петров',
      created_at: '2024-03-22T10:00:00Z',
      updated_at: '2024-03-22T12:00:00Z',
      avatar_path: null,
      is_active: true,
      is_email_verified: false,
    };

    mockedApiClient.put.mockResolvedValue({ data: mockUserResponse });

    const result = await updateUser(updateData);

    expect(mockedApiClient.put).toHaveBeenCalledWith('/profile', updateData);
    expect(result.first_name).toBe('Петр');
    expect(result.id).toBe(1);
  });

  test('выдает ошибку, если бэкенд прислал данные, не подходящие под UserSchema', async () => {
    mockedApiClient.put.mockResolvedValue({ data: { name: 'Broken' } });

    await expect(
      updateUser({ first_name: 'Test', last_name: 'Test', email: 'test@test.ru' }),
    ).rejects.toThrow();
  });
});
