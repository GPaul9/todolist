import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Project } from 'entities/project';
import { projectControlsSchema, ProjectModalEdit } from 'features/project';
import { parseParams, useDebounce } from 'shared/lib';

import { ProjectBoardInfinite } from './ProjectBoardInfinite';
import { ProjectBoardPagination } from './ProjectBoardPagination';

type TProps = {
  isArchive?: boolean;
  paginationMode?: 'pagination' | 'infinite';
  className?: string;
  listClassName?: string;
};

export const ProjectBoard = ({
  isArchive = false,
  paginationMode = 'pagination',
  className,
  listClassName,
}: TProps) => {
  const [editProject, setEditProject] = useState<Project | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const paramsObj = parseParams(searchParams, projectControlsSchema);
  const debouncedSearch = useDebounce(paramsObj.search, 400);
  const debouncedParams = useMemo(() => {
    return {
      ...paramsObj,
      search: debouncedSearch,
    };
  }, [paramsObj, debouncedSearch]);

  const handleFetchPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
  };

  return (
    <>
      {paginationMode === 'infinite' && (
        <ProjectBoardInfinite
          listClassName={listClassName}
          className={className}
          params={debouncedParams}
          isArchive={isArchive}
          onEdit={setEditProject}
        />
      )}
      {paginationMode === 'pagination' && (
        <ProjectBoardPagination
          className={className}
          listClassName={listClassName}
          isArchive={isArchive}
          params={debouncedParams}
          onFetchPage={handleFetchPage}
          onEdit={setEditProject}
        />
      )}

      {editProject && (
        <ProjectModalEdit
          project={editProject}
          isOpen={!!editProject}
          onClose={() => setEditProject(null)}
        />
      )}
    </>
  );
};
