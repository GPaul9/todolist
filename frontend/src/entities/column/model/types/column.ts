export type ColumnStatus =
  | 'active'
  | 'archived_by_user'
  | 'archived_by_cascade'
  | 'archived_by_user_and_cascade';

export type Column = {
  id: number;
  title: string;
  order: number;
  status: ColumnStatus;
  created_at: string;
  project_id: number;
};
