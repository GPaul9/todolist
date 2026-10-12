import { apiClient, apiClientPublic } from 'shared/api';

import { Attachment } from '../model/types/attachment';

export type UploadAttachmentParams = {
  file: File;
  parent: {
    type: 'task' | 'subtask';
    id: number;
  };
};

type UploadUrlResponce = {
  presigned_upload_url: string;
  uploaded: Omit<Attachment, 'id'> & { parent_id: number };
};

export const uploadAttachment = async ({ file, parent }: UploadAttachmentParams) => {
  const fileObj = {
    original_filename: file.name,
    size: file.size,
    mime_type: file.type,
    parent_type: parent.type,
    parent_id: parent.id,
  };

  const { data } = await apiClient.post<UploadUrlResponce>('/attachments/upload-url', fileObj);
  const { presigned_upload_url, uploaded } = data;

  await apiClientPublic.put(presigned_upload_url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

  const result = await apiClient.post<Attachment>('/attachments/confirm', {
    original_filename: uploaded.original_filename,
    size: uploaded.size,
    mime_type: uploaded.mime_type,
    parent_type: uploaded.parent_type,
    parent_id: uploaded.parent_id,
    s3_key: uploaded.s3_key,
  });

  return result.data;
};

export type DownloadAttachmentResponse = {
  presigned_download_url: string;
  downloaded: Attachment;
};

export const downloadAttachment = async (attachmentId: string) => {
  const res = await apiClient.get<DownloadAttachmentResponse>(
    `/attachments/${attachmentId}/download`,
  );

  return res.data;
};
