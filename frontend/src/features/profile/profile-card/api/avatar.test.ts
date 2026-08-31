import { apiClient } from 'shared/api';

import { uploadAvatar, deleteAvatar } from './avatar';

jest.mock('shared/api', () => ({
  apiClient: {
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('avatarApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uploadAvatarRequest: отправляет PATCH запрос с FormData', async () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    mockedApiClient.patch.mockResolvedValue({ data: { avatar_path: '/path.jpg' } });

    await uploadAvatar(mockFile);

    expect(mockedApiClient.patch).toHaveBeenCalledWith(
      'profile/avatar',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  });

  test('deleteAvatarRequest: отправляет DELETE запрос', async () => {
    mockedApiClient.delete.mockResolvedValue({});

    await deleteAvatar();

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/profile/avatar');
  });
});
