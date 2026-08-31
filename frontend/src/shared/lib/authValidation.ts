import { z } from 'zod';

const PASSWORD_FORBIDDEN_CHARS = /['"\\\/;#<>&@]|--/;

export const passwordSchema = z
  .string()
  .min(1, 'Пожалуйста, заполните все обязательные поля')
  .max(100, 'Максимум 100 символов')
  // Проверки состава (A-Z, a-z, 0-9, спецсимвол)
  .refine((val) => /[A-Z]/.test(val), 'Пароль должен содержать заглавную букву (A–Z)')
  .refine((val) => /[a-z]/.test(val), 'Пароль должен содержать строчную букву (a–z)')
  .refine((val) => /[0-9]/.test(val), 'Пароль должен содержать цифру (0–9)')
  .refine((val) => /[^A-Za-z0-9]/.test(val), 'Пароль должен содержать специальный символ')
  .min(12, 'Пароль должен содержать минимум 12 символов')

  // Проверка запрещенных символов
  .refine((val) => !PASSWORD_FORBIDDEN_CHARS.test(val), 'Пароль содержит недопустимый символ');

const EMAIL_ALLOWED_CHARS = /^[a-zA-Z0-9@.\-_]+$/;
// Запрещенные последовательности по ТЗ: -- и ..
const FORBIDDEN_SEQUENCES = /--|\.\./;
// Запрещенное начало по ТЗ: . или -
const FORBIDDEN_START = /^[.\-]/;
// Запрещенные спецсимволы по ТЗ: ' " \ ; # < > / &
const FORBIDDEN_SPEC_CHARS = /['"\\;#<>\/&]/;

export const emailSchema = z
  .string()
  .min(1, 'Пожалуйста, заполните все обязательные поля')
  .max(254, 'Общая длина не более 254 символов')
  .refine((val) => !/\s/.test(val), 'Пробелы недопустимы')
  .refine((val) => EMAIL_ALLOWED_CHARS.test(val), 'Проверьте введенные данные')
  .refine((val) => !FORBIDDEN_SPEC_CHARS.test(val), 'Проверьте введенные данные')
  .refine((val) => !FORBIDDEN_SEQUENCES.test(val), 'Проверьте введенные данные')
  .refine((val) => !FORBIDDEN_START.test(val), 'Проверьте введенные данные')
  .refine((val) => {
    const [local, domain] = val.split('@');
    if (!local || !domain) return false;
    // Локальная часть до 64, Домен до 159 (по ТЗ)
    return local.length <= 64 && domain.length <= 159;
  }, 'Проверьте введенные данные');
