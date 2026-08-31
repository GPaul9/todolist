from typing import Set


ALLOWED_EXTENSIONS = {
    # Изображения
    "jpg", "jpeg", "png", "gif", "webp", "bmp",
    # Документы
    "pdf", "txt",
    # Office (только новые форматы без макросов)
    "docx", "xlsx", "pptx",
    # Архивы (опционально)
    "zip", "7z"
}

ALLOWED_MIME_TYPE = {
    # Изображения
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
    # Документы
    "application/pdf", "text/plain",
    # Office
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",      # .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",           # .xlsx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",   # .pptx
    # Архивы
    "application/zip", "application/x-7z-compressed"
}


MIME_TO_EXTENSIONS: dict[str, Set[str]] = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/gif": {".gif"},
    "application/pdf": {".pdf"},
    "text/plain": {".txt"},
    "application/msword": {".doc"},
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {".docx"},
    "application/vnd.ms-excel": {".xls"},
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {".xlsx"},
    "application/vnd.ms-powerpoint": {".ppt"},
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {".pptx"},
}

MAX_FILE_SIZE = 10 * 1024 * 1024