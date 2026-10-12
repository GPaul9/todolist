import { TaskControlsType } from './taskTypes';

export const buildTaskParams = (paramsObj: TaskControlsType) => {
  const searchParams = new URLSearchParams();

  // search
  if (paramsObj.search) {
    searchParams.set('search', paramsObj.search);
  }

  // sort
  if (paramsObj.sort_by !== 'created_at' || paramsObj.order !== 'desc') {
    searchParams.set('sort_by', paramsObj.sort_by);
    searchParams.set('order', paramsObj.order);
  }

  // filter
  if (paramsObj.date_from) {
    searchParams.set('date_from', paramsObj.date_from.toISOString());
  }
  if (paramsObj.date_to) {
    searchParams.set('date_to', paramsObj.date_to.toISOString());
  }

  if (paramsObj.sts.length) {
    searchParams.set('sts', paramsObj.sts.join(','));
  }

  if (paramsObj.priority.length) {
    searchParams.set('priority', paramsObj.priority.join(','));
  }

  if (paramsObj.tags_ids.length) {
    searchParams.set('tags_ids', paramsObj.tags_ids.join(','));
  }

  return searchParams;
};
