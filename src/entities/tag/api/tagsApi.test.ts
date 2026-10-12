import { apiClient } from 'shared/api';

import { getTags, createTag } from '../api/tagsApi';

jest.mock('shared/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Tags API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getTags: запрашивает список тегов и возвращает данные', async () => {
    const mockData = [{ id: 1, name: 'Work', color: '#ff0000' }];
    mockedApiClient.get.mockResolvedValue({ data: mockData });

    const result = await getTags();

    expect(mockedApiClient.get).toHaveBeenCalledWith('/tags');
    expect(result).toEqual(mockData);
  });

  test('createTag: отправляет данные нового тега', async () => {
    const newTag = { name: 'Study', color: '#00ff00' };
    const mockResponse = { id: 2, ...newTag, user_id: 1 };

    mockedApiClient.post.mockResolvedValue({ data: mockResponse });

    const result = await createTag(newTag);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/tags', newTag);
    expect(result).toEqual(mockResponse);
  });
});
