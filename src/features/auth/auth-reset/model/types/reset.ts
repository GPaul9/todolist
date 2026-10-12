import { z } from 'zod';

import { emailSchema, passwordSchema } from 'shared/lib/authValidation';

export const resetRequestSchema = z.object({
  email: emailSchema,
});

export type ResetRequestFormData = z.infer<typeof resetRequestSchema>;

export const resetPasswordSchema = z
  .object({
    new_password: passwordSchema,
    confirm_password: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  repeat_password: string;
}
