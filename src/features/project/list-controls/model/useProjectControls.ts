import { useState } from 'react';

import { mergeParams, parseParams } from 'shared/lib';

import { buildProjectParams } from './buildProjectParams';
import { initialProjectControls, projectControlsSchema, ProjectControlsType } from './projectTypes';

export const useProjectControls = (
  params: URLSearchParams,
  setParams: (params: URLSearchParams) => void,
) => {
  const [controls, setControls] = useState<ProjectControlsType>(
    parseParams(params, projectControlsSchema),
  );

  const handleSearch = (value: string) => {
    setControls((prev) => ({ ...prev, search: value }));
  };

  const handleApply = () => {
    const mergedParams = mergeParams(
      buildProjectParams(controls),
      params,
      Object.keys(initialProjectControls),
    );
    setParams(mergedParams);
  };

  const handleSort = (field: ProjectControlsType['sort_by']) => {
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

  const handleReset = () => {
    const preservedParams = new URLSearchParams(params);
    for (const key of Object.keys(initialProjectControls)) {
      preservedParams.delete(key);
    }

    setControls(initialProjectControls);
    setParams(preservedParams);
  };

  return { controls, handleSearch, handleApply, handleSort, handleReset };
};
