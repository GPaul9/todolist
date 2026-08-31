import { formatDate, formatDateNumber, toDate } from './formatDate';

describe('formatDate utility', () => {
  test('formats ISO string in the existing text format by default', () => {
    const input = '2024-03-22T10:00:00Z';

    expect(formatDate(input)).toBe('22 мар. 2024');
  });

  test('formats ISO string in the numeric format when requested', () => {
    const input = '2025-07-23T10:00:00Z';

    expect(formatDate(input, 'numeric')).toBe('23.07.2025');
  });

  test('returns empty string when no value is passed', () => {
    expect(formatDate(undefined)).toBe('');
  });

  test('works with Date object for both formats', () => {
    const date = new Date(2024, 2, 22);

    expect(formatDate(date)).toBe('22 мар. 2024');
    expect(formatDate(date, 'numeric')).toBe('22.03.2024');
  });

  test('formatDateNumber возвращает пустую строку при undefined', () => {
    expect(formatDateNumber(undefined)).toBe('');
  });

  test('formatDateNumber форматирует дату корректно', () => {
    expect(formatDateNumber(new Date('2026-04-03'))).toBe('03.04.2026');
  });

  test('toDate возвращает undefined для некорректных значений', () => {
    expect(toDate(undefined)).toBeUndefined();
    expect(toDate('invalid date')).toBeUndefined();
    expect(toDate(123)).toBeUndefined();
  });

  test('toDate корректно преобразует строки и объекты Date', () => {
    const dateStr = '2026-04-03';
    const dateObj = new Date('2026-04-03');
    expect(toDate(dateStr)?.toISOString()).toBe(dateObj.toISOString());
    expect(toDate(dateObj)?.toISOString()).toBe(dateObj.toISOString());
  });
});
