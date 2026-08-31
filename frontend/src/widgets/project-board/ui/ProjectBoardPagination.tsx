import clsx from 'clsx';

import { Project, useProjectsList } from 'entities/project';
import {
  CreateProjectBtnCard,
  ProjectCard,
  ProjectControlsType,
  ProjectList,
} from 'features/project';
import { EmptyArchiveState, EmptyResultState, ErrorState, Pagination } from 'shared/ui';

import styles from './ProjectBoard.module.scss';
import { ProjectBoardSkeleton } from './ProjectBoardSkeleton';

type TProps = {
  params: ProjectControlsType;
  isArchive: boolean;
  onEdit: (project: Project) => void;
  onFetchPage: (page: number) => void;
  className?: string;
  listClassName?: string;
};

export const ProjectBoardPagination = ({
  params,
  isArchive,
  onEdit,
  onFetchPage,
  className,
  listClassName,
}: TProps) => {
  const { data, isLoading, refetch } = useProjectsList({
    params: {
      sort_by: params.sort_by,
      order: params.order,
      search: params.search,
      page: params.page,
      count: 9,
    },
    isArchived: isArchive,
  });

  if (isLoading) return <ProjectBoardSkeleton />;
  if (!data) return <ErrorState onRetry={refetch} />;

  const isEmpty = !data.data.length;
  const isSearching = !!params.search?.trim();

  if (isEmpty && !isSearching && isArchive) return <EmptyArchiveState />;
  if (isEmpty && !isSearching) return <CreateProjectBtnCard />;
  if (isEmpty && isSearching) return <EmptyResultState />;

  return (
    <div className={clsx(styles.board, className)}>
      <ProjectList data={data.data} getKey={(project) => project.id} className={listClassName}>
        {(project) => <ProjectCard project={project} onEdit={() => onEdit(project)} />}
      </ProjectList>

      {data.meta.totalPages > 0 && (
        <Pagination
          currentPage={data.meta.currentPage}
          totalPage={data.meta.totalPages}
          onFetch={onFetchPage}
        />
      )}
    </div>
  );
};
