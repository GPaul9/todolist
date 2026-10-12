import { ProjectControlsType } from './projectTypes';

export const buildProjectParams = (params: ProjectControlsType) => {
  const searchParams = new URLSearchParams();

  // search
  if (params.search) {
    searchParams.set('search', params.search);
  }

  // sort
  if (params.sort_by !== 'created_at' || params.order !== 'desc') {
    searchParams.set('sort_by', params.sort_by);
    searchParams.set('order', params.order);
  }

  return searchParams;
};
