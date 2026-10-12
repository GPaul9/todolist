import { Tag } from 'entities/tag';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  task_list_id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  status: Status;
  priority: Priority;
  progress: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  total_subtasks: number;
  completed_subtasks: number;
  tags: Tag[];
  total_attachments: number;
  total_reminders: number;
}
