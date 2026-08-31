import clsx from 'clsx';

import { Project, useProjectsListInfinite } from 'entities/project';
import {
  CreateProjectBtnCard,
  ProjectCard,
  ProjectControlsType,
  ProjectList,
} from 'features/project';
import { normalizeInfiniteData } from 'shared/lib';
import { EmptyArchiveState, EmptyResultState, ErrorState, InfinitePagination } from 'shared/ui';

import styles from './ProjectBoard.module.scss';
import { ProjectBoardSkeleton } from './ProjectBoardSkeleton';

type TProps = {
  params: ProjectControlsType;
  isArchive: boolean;
  onEdit: (project: Project) => void;
  className?: string;
  listClassName?: string;
};

export const ProjectBoardInfinite = ({
  params,
  isArchive,
  onEdit,
  className,
  listClassName,
}: TProps) => {
  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, refetch } =
    useProjectsListInfinite({
      params: {
        sort_by: params.sort_by,
        order: params.order,
        search: params.search,
        count: 9,
      },
      isArchived: isArchive,
    });

  if (isLoading) return <ProjectBoardSkeleton />;
  if (!data) return <ErrorState onRetry={refetch} />;

  const normalizeData = normalizeInfiniteData(data);

  const isEmpty = !normalizeData.length;
  const isSearching = !!params.search?.trim();

  if (isEmpty && !isSearching && isArchive) return <EmptyArchiveState />;
  if (isEmpty && !isSearching) return <CreateProjectBtnCard />;
  if (isEmpty && isSearching) return <EmptyResultState />;

  return (
    <div className={clsx(styles.board, className)}>
      <ProjectList data={normalizeData} getKey={(project) => project.id} className={listClassName}>
        {(project) => <ProjectCard project={project} onEdit={() => onEdit(project)} />}
      </ProjectList>

      <InfinitePagination
        hasNextPage={hasNextPage}
        onFetch={fetchNextPage}
        isLoading={isFetching}
      />
    </div>
  );
};
