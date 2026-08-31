import { Attachment } from 'entities/attachment';

export type SubtaskStatus = 'todo' | 'done';

export interface Subtask {
  title: string;
  description: string | null;
  id: number;
  status: SubtaskStatus;
  position: number;
  task_id: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  attachments: Attachment[];
}
