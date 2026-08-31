const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'docx', 'xlsx', 'pptx'];

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MAX_SIZE = 10 * 1024 * 1024; 
const MAX_COUNT = 5;

export const validateFile = (file: File, currentCount: number, skipCount = false): string | null => {
  if (!skipCount && currentCount >= MAX_COUNT) {
    return `Максимум ${MAX_COUNT} вложений`;
  }

  if (file.size === 0) {
    return 'Нельзя загрузить пустой файл';
  }
  
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Недопустимый формат файла';
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Недопустимый формат файла';
  }

   if (file.size > MAX_SIZE) {
    return 'Файл не может весить больше 10 МБ';
  }

  return null;
};
