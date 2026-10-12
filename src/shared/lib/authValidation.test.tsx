import { emailSchema, passwordSchema } from './authValidation';

describe('authSchema validation', () => {
  describe('emailSchema', () => {
    test('должен принимать валидный email', () => {
      const result = emailSchema.safeParse('test.user@example.com');
      expect(result.success).toBe(true);
    });

    test('должен возвращать ошибку при двойных точках', () => {
      const result = emailSchema.safeParse('test..user@example.com');
      expect(result.success).toBe(false);
      // @ts-ignore
      expect(result.error.issues[0].message).toBe('Проверьте введенные данные');
    });

    test('должен ограничивать длину локальной части до 64 символов', () => {
      const longLocal = 'a'.repeat(65) + '@mail.ru';
      const result = emailSchema.safeParse(longLocal);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    test('должен принимать сложный пароль 12+ символов', () => {
      const result = passwordSchema.safeParse('Password123!');
      expect(result.success).toBe(true);
    });

    test('должен падать без спецсимвола', () => {
      const result = passwordSchema.safeParse('Password1234');
      expect(result.success).toBe(false);
      // @ts-ignore
      expect(result.error.issues[0].message).toBe('Пароль должен содержать специальный символ');
    });
  });
});
