import { apiClient } from 'shared/api';

import { resendRequest, verifyEmailRequest } from '../api/confirm';

jest.mock('shared/api');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('confirm-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resendRequest вызывается с правильными url, data', async () => {
    const formData = 'test@mail.ru';

    const mockResponse = {
      message: 'message',
    };

    mockedApiClient.post.mockResolvedValue({ data: mockResponse });

    const result = await resendRequest(formData);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/send-verification-email', { email: 'test@mail.ru' });
    expect(result).toEqual(mockResponse);
  });

  it('verifyEmailRequest вызывается с правильными url, data', async () => {
    const formData = { token: 'token' };

    const mockResponse = {
      message: 'message',
    };

    mockedApiClient.post.mockResolvedValue({ data: mockResponse });

    const result = await verifyEmailRequest(formData);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/confirm/verify', formData);
    expect(result).toEqual(mockResponse);
  });
});
