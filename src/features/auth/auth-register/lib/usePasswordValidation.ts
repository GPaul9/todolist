export const forbiddenChars = /['"\\\/;#<>&@]|--/;

export const usePasswordValidation = (password: string) => {
  const criteria = {
    'Минимум 12 символов': password.length >= 12,
    'Заглавная буква (A-Z)': /[A-Z]/.test(password),
    'Строчная буква (a-z)': /[a-z]/.test(password),
    'Цифра (0-9)': /\d/.test(password),
    Спецсимвол: /[^A-Za-z0-9]/.test(password),
    'Нет запрещенных символов': password.length > 0 && !forbiddenChars.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;

  return { criteria, strengthScore: score, isValid: score === 6 };
};
