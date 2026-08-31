import { apiClient } from 'shared/api';

import { loginRequest } from './login';

jest.mock('shared/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('loginRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Отправляет запрос с данными и возвращает ответ', async () => {
    const formData = {
      email: 'test@mail.ru',
      password: '123456',
    };

    const mockResponse = {
      access_token: 'accessToken',
      token_type: 'tokenType',
    };

    mockedApiClient.post.mockResolvedValue({ data: mockResponse });

    const result = await loginRequest(formData);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/applogin', formData);
    expect(result).toEqual(mockResponse);
  });
});
