import { z } from 'zod';

import { toDate } from './formatDate';

export const mergeParams = (
  newParams: URLSearchParams,
  currentParams: URLSearchParams,
  replaceArr?: string[],
) => {
  const merged = new URLSearchParams(currentParams);

  if (replaceArr) {
    for (const key of replaceArr) {
      merged.delete(key);
    }
  } else {
    for (const key of newParams.keys()) {
      merged.delete(key);
    }
  }

  for (const [key, value] of newParams.entries()) {
    merged.append(key, value);
  }

  return merged;
};

export const parseParams = <T extends z.ZodObject<any>>(
  params: URLSearchParams,
  schema: T,
): z.infer<T> => {
  const result: Record<string, unknown> = {};

  const unwrap = (schema: any): any => {
    if (schema instanceof z.ZodDefault || schema instanceof z.ZodOptional) {
      return unwrap(schema.def.innerType);
    }
    return schema;
  };

  params.forEach((value, key) => {
    const rawField = schema.shape[key];
    if (!rawField) return;

    const unwrapped = unwrap(rawField);

    if (unwrapped instanceof z.ZodArray) {
      const arrayValues = value.split(',').filter(Boolean);
      const arrayField = unwrapped as z.ZodArray<any>;

      let parsedArray: any[] = [];

      if (arrayField.element instanceof z.ZodNumber) {
        parsedArray = arrayValues
          .map(Number)
          .filter((v) => arrayField.element.safeParse(v).success);
      } else if (arrayField.element instanceof z.ZodDate) {
        parsedArray = arrayValues.map((v) => toDate(v)).filter(Boolean);
      } else if (arrayField.element instanceof z.ZodBoolean) {
        parsedArray = arrayValues
          .map((v) => v === 'true')
          .filter((v) => arrayField.element.safeParse(v).success);
      } else {
        parsedArray = arrayValues.filter((v) => arrayField.element.safeParse(v).success);
      }

      if (parsedArray.length) result[key] = [...new Set(parsedArray)];
      return;
    }

    let parsedValue: any = value;
    const typeName = unwrapped.def?.typeName;

    if (typeName === 'ZodNumber') parsedValue = Number(value);
    else if (typeName === 'ZodBoolean') parsedValue = value === 'true';
    else if (typeName === 'ZodDate') parsedValue = toDate(value);

    const safe = rawField.safeParse(parsedValue);
    if (safe.success) result[key] = safe.data;
  });

  const parsed = schema.safeParse(result);
  return parsed.success ? parsed.data : schema.parse({});
};
