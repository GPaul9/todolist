import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  avatar_path: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  email_notifications: z.boolean().default(false),
  webpush_notifications: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;
