import { ProjectControlsType } from 'features/project/list-controls/model/projectTypes';
import { apiClient, ApiResponse, PaginationMeta } from 'shared/api';

import { Project, ProjectStatus } from '../model/types/project';

// getProjectsList
export type GetProjectListParams = {
  params: {
    search?: string;
    statuses?: ProjectStatus[];
    sort_by?: ProjectControlsType['sort_by'];
    order?: ProjectControlsType['order'];
    page?: number;
    count?: number;
  };
};

export type GetProjectListResponce = ApiResponse<Project[], PaginationMeta>;

export const getProjectsList = async ({
  params,
}: GetProjectListParams): Promise<GetProjectListResponce> => {
  const response = await apiClient.get<GetProjectListResponce>('/projects', {
    params,
  });

  return response.data;
};

//getProjectById
export const getProjectById = async (projectId: number): Promise<Project> => {
  const response = await apiClient.get<Project>(`/projects/${projectId}`);

  return response.data;
};

// createProject
export type CreateProjectParams = {
  data: Pick<Project, 'title' | 'description' | 'status'>;
};

export const createProject = async ({ data }: CreateProjectParams): Promise<Project> => {
  const response = await apiClient.post<Project>('/projects', data);

  return response.data;
};

// updateProject
export type UpdateProjectParams = {
  projectId: number;
  data: Partial<Pick<Project, 'title' | 'description' | 'status'>>;
};

export const updateProject = async ({ projectId, data }: UpdateProjectParams): Promise<Project> => {
  const response = await apiClient.patch<Project>(`/projects/${projectId}`, data);

  return response.data;
};

// deleteProject
export const deleteProject = async (projectId: number): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};

// archiveProject
export const archiveProject = async (projectId: number): Promise<Project> => {
  const response = await apiClient.patch(`/projects/${projectId}/archive`);

  return response.data;
};

// unArchiveProject
export const unArchiveProject = async (projectId: number): Promise<Project> => {
  const response = await apiClient.patch(`/projects/${projectId}/unarchive`);

  return response.data;
};
