import { z } from 'zod';

export interface Tag {
  id: number;
  name: string;
  color: string;
  task_count: number;
}

export const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Введите название')
    .max(30, 'Название не может быть длиннее 30 символов'),
  color: z.string(),
});

export const editSchema = createSchema.extend({
  id: z.number(),
});

export type CreateTag = z.infer<typeof createSchema>;
export type EditTag = z.infer<typeof editSchema>;
