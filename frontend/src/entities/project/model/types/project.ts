export type ProjectStatus = 'active' | 'archived_by_user';

export type Project = {
  id: number;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  total_tasks: number;
  completed_tasks: number;
};
