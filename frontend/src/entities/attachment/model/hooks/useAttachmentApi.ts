import { useMutation } from '@tanstack/react-query';

import { downloadAttachment } from '../../api/attachmentApi';

export const useDownloadAttachment = () => {
  return useMutation({
    mutationFn: (attachmentId: string) => downloadAttachment(attachmentId),

    onSuccess: (data) => {
      window.open(data.presigned_download_url, '_blank');
    },
  });
};
