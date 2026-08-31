import { z } from 'zod';

import { emailSchema, passwordSchema } from 'shared/lib';

const NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;

export const BaseUpdateUserSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов')
    .regex(NAME_REGEX, 'Поле может содержать только буквы, дефис или пробел')
    .nullable(),
  last_name: z
    .string()
    .trim()
    .min(2, 'Минимум 2 символа')
    .max(100, 'Максимум 100 символов')
    .regex(NAME_REGEX, 'Поле может содержать только буквы, дефис или пробел')
    .nullable(),
  email: emailSchema.nullable(),
  password: passwordSchema.optional().nullable(),
  new_password: passwordSchema.optional().nullable(),
  repeat_password: z.string().optional().nullable(),
  is_email_verified: z.boolean().optional().nullable(),
  avatar_path: z.string().optional().nullable().nullable(),
  email_notifications: z.boolean().default(false),
  webpush_notifications: z.boolean().default(false),
});

export const UpdateUserSchema = BaseUpdateUserSchema.refine(
  (data) => {
    if (data.new_password && data.new_password !== data.repeat_password) {
      return false;
    }
    return true;
  },
  {
    message: 'Пароли не совпадают. Пожалуйста, введите одинаковые пароли.',
    path: ['repeat_password'],
  },
).refine(
  (data) => {
    if (!data.email || !data.new_password) return true;
    const emailLower = data.email.toLowerCase();
    const passwordLower = data.new_password.toLowerCase();
    return !passwordLower.includes(emailLower);
  },
  {
    message: 'Пароль не должен содержать email',
    path: ['new_password'],
  },
);

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const ProfileNamesSchema = BaseUpdateUserSchema.pick({
  first_name: true,
  last_name: true,
});

export type ProfileNamesData = z.infer<typeof ProfileNamesSchema>;

export const ProfileEmailSchema = BaseUpdateUserSchema.pick({ email: true });
export type ProfileEmailData = z.infer<typeof ProfileEmailSchema>;

export const UpdatePasswordSchema = z
  .object({
    password: z.string().min(1, 'Введите текущий пароль'),
    new_password: passwordSchema,
    repeat_password: z.string().optional(),
  })
  .refine((data) => data.password !== data.new_password, {
    message: 'Новый пароль не должен совпадать со старым',
    path: ['new_password'],
  });

export type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;
