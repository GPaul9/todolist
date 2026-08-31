import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { notice } from 'shared/ui';

import { getTags, createTag, editTag, deleteTag } from '../../api/tagsApi';
import { Tag, EditTag } from '../types/tag';

export const useGetTags = () => {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: getTags,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: number) => deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: () => {
      notice.error('Ошибка при удалении тега');
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditTag) => editTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
