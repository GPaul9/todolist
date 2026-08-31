import { useMediaQuery } from 'react-responsive';
import { Navigate, useParams } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import { useGetColumns } from 'entities/column';
import { useProjectById } from 'entities/project';
import { UnArchiveProjectBtn } from 'features/project';
import { PageLoader } from 'shared/ui';
import { PageLayout, TaskBoard, TaskControlsView } from 'widgets';

import styles from './ProjectBoardPageArchive.module.scss';

const ProjectBoardPageArchive = () => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const { id } = useParams();
  const projectId = Number(id);

  const { data, isLoading, isError, error } = useProjectById({
    projectId,
    enabled: !Number.isNaN(projectId),
  });

  const columnsQuery = useGetColumns({
    params: { project_id: projectId ?? data?.id },
    isArchived: true,
  });

  if (isLoading) return <PageLoader />;
  if (isError) {
    const status = error?.response?.status;
    let message = 'Ошибка при получении данных. Попробуйте позже.';

    if (status === 404) message = 'Ошибка! Проект с таким ID не найден.';
    return <Navigate to={'/archive'} state={{ notice: { type: 'error', message: message } }} />;
  }
  if (!data)
    return (
      <Navigate
        to={'/archive'}
        state={{ notice: { type: 'error', message: 'Не удалось получить данные проекта' } }}
      />
    );

  return (
    <PageLayout
      noScroll
      title={'Архивный проект'}
      backPath={'/archive'}
      headerActions={isTablet && <TaskControlsView />}
      breadcrumbsItems={[
        { label: 'Архив', href: '/archive' },
        { label: 'Архивный проект', href: '#' },
      ]}
    >
      <PageLayout.LeftContent>
        <UnArchiveProjectBtn projectId={projectId ?? data?.id} />
      </PageLayout.LeftContent>
      <PageLayout.RightContent>{!isTablet && <TaskControlsView />}</PageLayout.RightContent>

      <div className={styles.page}>
        <div className="container">
          <TaskBoard dataQuery={columnsQuery} isArchive={true} enableDnD={false} />
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectBoardPageArchive;
