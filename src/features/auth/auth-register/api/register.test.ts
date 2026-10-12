import { apiClient } from 'shared/api';

import { registerRequest } from './register';

jest.mock('shared/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('registerRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Отправляет запрос с данными и возвращает response.data', async () => {
    const formData = {
      first_name: 'name',
      last_name: 'last-name',
      email: 'test@mail.ru',
      password: '1234567890',
      repeat_password: '1234567890',
      consent_personal_data: true,
      privacy_policy_agreement: true,
    };

    const mockResponse = {
      message: 'message',
    };

    mockedApiClient.post.mockResolvedValue({
      data: mockResponse,
    });

    const result = await registerRequest(formData);

    expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register', formData);
    expect(result).toEqual(mockResponse);
  });
});
