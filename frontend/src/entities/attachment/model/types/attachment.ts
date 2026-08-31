export interface Attachment {
  parent_id: number;
  id: string;
  original_filename: string;
  size: number;
  mime_type: string;
  s3_key: string;
  parent_type: 'task' | 'subtask';
}
