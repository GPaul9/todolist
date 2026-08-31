type DateFormatVariant = 'text' | 'numeric';

export const formatDate = (
  dateString?: string | Date,
  variant: DateFormatVariant = 'text',
): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (variant === 'numeric') {
    return `${day}.${monthNumber}.${year}`;
  }

  const monthText = date
    .toLocaleString('ru-RU', { month: 'short' })
    .replace('.', '')
    .slice(0, 3)
    .toLowerCase();

  return `${day} ${monthText}. ${year}`;
};

export const formatDateNumber = (dateValue: Date | undefined | string | null): string => {
  const date = toDate(dateValue);
  if (!date) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

export const toDate = (value: unknown): Date | undefined => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return new Date(value);
  return undefined;
};

export const formatLocalTime = (isoString: string | Date | null | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString);

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
