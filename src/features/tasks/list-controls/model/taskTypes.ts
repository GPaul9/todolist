import { z } from 'zod';

export const taskControlsSchema = z.object({
  search: z.string().default(''),
  sort_by: z.enum(['created_at', 'deadline', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  sts: z.array(z.enum(['todo', 'in_progress', 'done'])).default([]),
  priority: z.array(z.enum(['low', 'medium', 'high'])).default([]),
  tags_ids: z.array(z.coerce.number()).default([]),
});

export type TaskControlsType = z.infer<typeof taskControlsSchema>;

export const initialTaskControls: TaskControlsType = {
  search: '',
  sort_by: 'created_at',
  order: 'desc',
  date_from: undefined,
  date_to: undefined,
  sts: [],
  priority: [],
  tags_ids: [],
};
