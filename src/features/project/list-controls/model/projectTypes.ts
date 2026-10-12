import z from 'zod';

export const projectControlsSchema = z.object({
  sort_by: z.enum(['created_at', 'updated_at', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().default(''),
  page: z.coerce.number().default(1),
});

export type ProjectControlsType = z.infer<typeof projectControlsSchema>;

export const initialProjectControls: ProjectControlsType = {
  search: '',
  sort_by: 'created_at',
  order: 'desc',
  page: 1,
};
