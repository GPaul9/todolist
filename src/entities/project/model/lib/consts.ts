import { ProjectStatus } from '../types/project';

export const STATUS_MAP: Record<ProjectStatus, { label: string }> = {
  active: { label: 'Активный' },
  archived_by_user: { label: 'Архивный' },
};
