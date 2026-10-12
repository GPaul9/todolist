import { apiClient } from 'shared/api';

import { logoutRequest } from './logout';

jest.mock('shared/api/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('logoutRequest', () => {
  it('Отправляет запрос и возвращает response.data', async () => {
    const mockResponse = 'string';

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await logoutRequest();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    expect(result).toBe(mockResponse);
  });
});
