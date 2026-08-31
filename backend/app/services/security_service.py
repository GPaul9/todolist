import asyncio
import io
import logging
from pathlib import Path
import socket

from clamav_client.clamd import ClamdNetworkSocket, CommunicationError
from fastapi.concurrency import run_in_threadpool
import magic

from app.core.constants import MIME_TO_EXTENSIONS
from app.core.exceptions.attachment import AttachmentExtensionError, AttachmentMimeTypeError, AttachmentScanFailedError, AttachmentScanTimeoutError, AttachmentSizeError, \
    AttachmentVirusDetectedError


logger = logging.getLogger(__name__)


class SecurityService:

    def __init__(self) -> None:
        self.clamav_host = "clamav"
        self.clamav_port = 3310
        self.clamav_timeout = 15

    async def validate_file_content(
            self,
            file_bytes: bytes,
            original_filename: str,
            declaired_mime: str,
            declaired_size: int
    ) -> None:

        if len(file_bytes) != declaired_size:
            raise AttachmentSizeError()

        real_mime = magic.from_buffer(file_bytes, mime=True)
        if real_mime != declaired_mime:
            raise AttachmentMimeTypeError()

        allowed_exts = MIME_TO_EXTENSIONS.get(real_mime, set())
        actual_ext = Path(original_filename).suffix.lower()

        if actual_ext not in allowed_exts:
            raise AttachmentExtensionError()

        try:
            is_clean = await self._scan_with_clamav(file_bytes)
            if not is_clean:
                raise AttachmentVirusDetectedError()
        except (AttachmentScanTimeoutError, AttachmentScanFailedError):
            logger.warning("Skipping antivirus due to timeout/failure")
            pass

    async def _scan_with_clamav(self, file_bytes: bytes) -> bool:
        def _scan():
            try:
                cd_scanner = ClamdNetworkSocket(
                    host=self.clamav_host,
                    port=self.clamav_port,
                    timeout=self.clamav_timeout
                )
                result = cd_scanner.instream(io.BytesIO(file_bytes))
                status, signature = result.get(
                    'stream', ('ERROR', None)
                    )
                
                if status == 'FOUND':
                    logger.warning(
                        f"ClamAV FOUND: {signature}"
                    )
                    return False
            
                return status == 'OK'
            except socket.timeout:
                raise AttachmentScanTimeoutError()
            except CommunicationError as e:
                if "timed_out" in str(e):
                    raise AttachmentScanTimeoutError()
                else:
                    raise AttachmentScanFailedError() 
            except Exception as e:
                logger.exception("Unexpected ClamAV error")
                raise AttachmentScanFailedError(
                    "Antivirus service unavailable"
                    )

        return await run_in_threadpool(_scan)
