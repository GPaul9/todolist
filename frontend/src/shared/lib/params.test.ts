import { z } from 'zod';

import { mergeParams, parseParams } from 'shared/lib/params';

// мок toDate, чтобы не зависеть от реальной реализации
jest.mock('./formatDate', () => ({
  toDate: (value: string) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  },
}));

describe('mergeParams', () => {
  test('должен добавить новые параметры к текущим', () => {
    const current = new URLSearchParams('a=1&b=2');
    const newParams = new URLSearchParams('c=3');

    const merged = mergeParams(newParams, current);

    expect(merged.toString()).toBe('a=1&b=2&c=3');
  });

  test('должен заменить параметры, если ключи совпадают', () => {
    const current = new URLSearchParams('a=1&b=2');
    const newParams = new URLSearchParams('b=999');

    const merged = mergeParams(newParams, current);

    expect(merged.get('a')).toBe('1');
    expect(merged.get('b')).toBe('999');
  });

  test('должен удалить и заменить только ключи из replaceArr', () => {
    const current = new URLSearchParams('a=1&b=2&c=3');
    const newParams = new URLSearchParams('b=999');

    const merged = mergeParams(newParams, current, ['b']);

    expect(merged.get('a')).toBe('1');
    expect(merged.get('b')).toBe('999');
    expect(merged.get('c')).toBe('3');
  });

  test('должен уметь добавлять несколько значений одного ключа', () => {
    const current = new URLSearchParams('a=1');
    const newParams = new URLSearchParams('arr=1&arr=2');

    const merged = mergeParams(newParams, current);

    expect(merged.getAll('arr')).toEqual(['1', '2']);
  });
});

describe('parseParams', () => {
  test('должен парсить number', () => {
    const schema = z.object({
      page: z.coerce.number(),
    });

    const params = new URLSearchParams('page=10');
    const parsed = parseParams(params, schema);

    expect(parsed.page).toBe(10);
  });

  test('должен парсить boolean', () => {
    const schema = z.object({
      active: z.coerce.boolean(),
    });

    const params = new URLSearchParams('active=true');
    const parsed = parseParams(params, schema);

    expect(parsed.active).toBe(true);
  });

  test('должен парсить date', () => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const params = new URLSearchParams('date=2024-01-01');
    const parsed = parseParams(params, schema);

    expect(parsed.date).toBeInstanceOf(Date);
  });

  test('должен парсить массив чисел', () => {
    const schema = z.object({
      ids: z.array(z.number()),
    });

    const params = new URLSearchParams('ids=1,2,3');
    const parsed = parseParams(params, schema);

    expect(parsed.ids).toEqual([1, 2, 3]);
  });

  test('должен парсить массив boolean', () => {
    const schema = z.object({
      flags: z.array(z.boolean()),
    });

    const params = new URLSearchParams('flags=true,false,true');
    const parsed = parseParams(params, schema);

    expect(parsed.flags).toEqual([true, false]);
  });

  test('должен парсить массив date', () => {
    const schema = z.object({
      dates: z.array(z.date()),
    });

    const params = new URLSearchParams('dates=2024-01-01,2024-02-02');
    const parsed = parseParams(params, schema);

    expect(parsed.dates.length).toBe(2);
    expect(parsed.dates[0]).toBeInstanceOf(Date);
    expect(parsed.dates[1]).toBeInstanceOf(Date);
  });

  test('должен удалять дубликаты в массиве', () => {
    const schema = z.object({
      ids: z.array(z.number()),
    });

    const params = new URLSearchParams('ids=1,2,2,3,3');
    const parsed = parseParams(params, schema);

    expect(parsed.ids).toEqual([1, 2, 3]);
  });

  test('должен игнорировать неизвестные ключи', () => {
    const schema = z.object({
      page: z.coerce.number().optional(),
    });

    const params = new URLSearchParams('unknown=999');
    const parsed = parseParams(params, schema);

    expect(parsed).toEqual({});
  });

  test('должен возвращать дефолтные значения если schema.parse({}) проходит', () => {
    const schema = z.object({
      page: z.number().default(1),
      active: z.boolean().default(false),
    });

    const params = new URLSearchParams('');
    const parsed = parseParams(params, schema);

    expect(parsed).toEqual({
      page: 1,
      active: false,
    });
  });

  test('должен корректно работать с optional', () => {
    const schema = z.object({
      page: z.number().optional(),
    });

    const params = new URLSearchParams('');
    const parsed = parseParams(params, schema);

    expect(parsed).toEqual({});
  });

  test('должен игнорировать невалидные значения', () => {
    const schema = z.object({
      page: z.coerce.number(),
    });

    const params = new URLSearchParams('page=abc');

    expect(() => parseParams(params, schema)).toThrow();
  });

  test('должен фильтровать невалидные элементы массива', () => {
    const schema = z.object({
      ids: z.array(z.number()),
    });

    const params = new URLSearchParams('ids=1,2,abc,3');
    const parsed = parseParams(params, schema);

    expect(parsed.ids).toEqual([1, 2, 3]);
  });

  test('должен парсить array строк', () => {
    const schema = z.object({
      tags: z.array(z.string()),
    });

    const params = new URLSearchParams('tags=react,ts,redux');
    const parsed = parseParams(params, schema);

    expect(parsed.tags).toEqual(['react', 'ts', 'redux']);
  });
});
