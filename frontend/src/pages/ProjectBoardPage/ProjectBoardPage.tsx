import { useMediaQuery } from 'react-responsive';
import { Navigate, useParams } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import { useGetColumns } from 'entities/column';
import { useProjectById, useSuggestArchiveProject } from 'entities/project';
import { CreateColumnBtn } from 'features/tasks-column';
import { PageLoader } from 'shared/ui';
import { PageLayout, TaskBoard, TaskControlsView } from 'widgets';

import styles from './ProjectBoardPage.module.scss';

const ProjectBoardPage = () => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  const { id } = useParams();
  const projectId = Number(id);

  const { data, isLoading, isError, error } = useProjectById({
    projectId,
    enabled: !Number.isNaN(projectId),
  });

  const columnsQuery = useGetColumns({
    params: { project_id: projectId ?? data?.id },
    isArchived: false,
  });

  useSuggestArchiveProject(data);

  if (isLoading) return <PageLoader />;
  if (isError) {
    const status = error?.response?.status;
    let message = 'Ошибка при получении данных. Попробуйте позже.';

    if (status === 404) message = 'Ошибка! Проект с таким ID не найден.';
    return <Navigate to={'/project'} state={{ notice: { type: 'error', message: message } }} />;
  }
  if (!data)
    return (
      <Navigate
        to={'/project'}
        state={{ notice: { type: 'error', message: 'Не удалось получить данные проекта' } }}
      />
    );

  return (
    <PageLayout
      noScroll
      title={data.title}
      headerActions={isTablet && <TaskControlsView />}
      breadcrumbsItems={[
        { label: 'Мои проекты', href: '/project' },
        { label: 'Задачи', href: '#' },
      ]}
    >
      <PageLayout.LeftContent>
        {!isMobile && <CreateColumnBtn projectId={data.id} />}
      </PageLayout.LeftContent>
      <PageLayout.RightContent>{!isTablet && <TaskControlsView />}</PageLayout.RightContent>

      <div className={styles.page}>
        <div className="container">
          <TaskBoard dataQuery={columnsQuery} />
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectBoardPage;
