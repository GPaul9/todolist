from typing import Any, Dict, Optional

from app.core.exceptions.base import AppException


class AttachmentParentNotFoundError(AppException):
    def __init__(self, detail: Optional[str]):
        super().__init__(
            message=f"Attachment parent is not found. Functions - {detail}",
            status_code=404
        )


class AttachmentNotFoundError(AppException):
    def __init__(self):
        super().__init__(
            message="Attachment not found in database",
            status_code=400
        )


class AttachmentParentTypeError(AppException):
    def __init__(self):
        super().__init__(
            message="Parent type dont match",
            status_code=400
        )



class AttachmentParentIDError(AppException):
    def __init__(self):
        super().__init__(
            message="Parent ID dont match",
            status_code=404
        )


class AttachmentParentArchivedError(AppException):
    def __init__(self):
        super().__init__(
            message="Cannot add attachment in archived parent",
            status_code=404
        )


class AttachmentNotOwnerError(AppException):
    def __init__(self):
        super().__init__(
            message="Attachment not allowed this user",
            status_code=403
        )

class AttNotFoundInStorageError(AppException):
    def __init__(self):
        super().__init__(
            message="Attachment not found in MinIO storage",
            status_code=404
        )

class AttachmentAlreadyExistsError(AppException):
    def __init__(self):
        super().__init__(
            message="Attachment already exists in MinIO storage and db",
            status_code=400
        )

class AttachmentAlreadyConfirmedError(AppException):
    def __init__(self):
        super().__init__(
            message="Attachment already confirmed",
            status_code=400
        )

class AttachmentConfirmationError(AppException):
    def __init__(self):
        super().__init__(
            message="Attachment confirmation already initiated",
            status_code=400
        )

class AttachmentTaskCountError(AppException):
    def __init__(self):
        super().__init__(
            message="Count attachments for task type should be less or equal 5",
            status_code=400
        )

class AttachmentSubTaskCountError(AppException):
    def __init__(self):
        super().__init__(
            message="Count attachments for subtask type should be less or equal 1",
            status_code=400
        )

class AttachmentSecurityError(AppException):
    def __init__(self, message: str = "Security validation failed"):
        super().__init__(message, status_code=400)

class AttachmentVirusDetectedError(AttachmentSecurityError):
    def __init__(self):
        super().__init__(
            message="Virus detected in file",
        )

class AttachmentSizeError(AttachmentSecurityError):
    def __init__(self):
        super().__init__(
            message="Size mismatch",
        )

class AttachmentMimeTypeError(AttachmentSecurityError):
    def __init__(self):
        super().__init__(
            message="MIME type mismatch",
        )

class AttachmentExtensionError(AttachmentSecurityError):
    def __init__(self):
        super().__init__(
            message="Extension does not match MIME type",
        )

class AttachmentScanTimeoutError(AttachmentSecurityError):
    def __init__(self) -> None:
        super().__init__(
            message="File scan timed out"
        )

class AttachmentScanFailedError(AttachmentSecurityError):
    def __init__(self, reason: str = "Scan failed") -> None:
        super().__init__(
            message=reason
        )
