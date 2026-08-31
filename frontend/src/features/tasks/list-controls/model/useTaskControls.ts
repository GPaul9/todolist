import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { mergeParams, parseParams } from 'shared/lib/params';

import { buildTaskParams } from './buildTaskParams';
import { initialTaskControls, taskControlsSchema, TaskControlsType } from './taskTypes';

export const useTaskControls = (
  params: URLSearchParams,
  setParams: (params: URLSearchParams) => void,
) => {
  const [controls, setControls] = useState<TaskControlsType>(
    parseParams(params, taskControlsSchema),
  );

  const handleSearch = (value: string) => {
    setControls((prev) => ({ ...prev, search: value }));
  };

  const handleApply = () => {
    const mergedParams = mergeParams(
      buildTaskParams(controls),
      params,
      Object.keys(initialTaskControls),
    );
    setParams(mergedParams);
  };

  const handleSort = (field: TaskControlsType['sort_by']) => {
    setControls((prev) => {
      if (prev.sort_by === field) {
        return {
          ...prev,
          order: prev.order === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        ...prev,
        sort_by: field,
        order: 'asc',
      };
    });
  };

  const handleFilter = <T extends keyof TaskControlsType>(
    field: T,
    value: TaskControlsType[T] extends (infer U)[] ? U : never,
    checked: boolean,
  ) => {
    setControls((prev) => {
      const current = prev[field];

      if (!Array.isArray(current)) {
        return prev;
      }

      return {
        ...prev,
        [field]: checked ? [...current, value] : current.filter((item) => item !== value),
      };
    });
  };

  const handleDate = (range: DateRange | undefined) => {
    setControls((prev) => ({
      ...prev,
      date_from: range?.from,
      date_to: range?.to,
    }));
  };

  const handleReset = () => {
    const preservedParams = new URLSearchParams(params);
    for (const key of Object.keys(initialTaskControls)) {
      preservedParams.delete(key);
    }

    setControls(initialTaskControls);
    setParams(preservedParams);
  };

  return { controls, handleSearch, handleApply, handleSort, handleFilter, handleDate, handleReset };
};
