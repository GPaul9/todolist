import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Неверный формат почты'),
  password: z.string().min(1, 'Введите пароль'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
