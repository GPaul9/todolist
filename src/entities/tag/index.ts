export type { Tag, CreateTag, EditTag } from './model/types/tag';
export { createSchema, editSchema } from './model/types/tag';
export { getTags, createTag, editTag, deleteTag } from './api/tagsApi';
export { useGetTags, useCreateTag, useDeleteTag, useUpdateTag } from './model/hooks/useTagApi';
