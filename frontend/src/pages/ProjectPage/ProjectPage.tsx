import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { useProjectsMeta } from 'entities/project';
import { CreateProjectBtn } from 'features/project';
import { PageLayout, ProjectBoard, ProjectControlsView } from 'widgets';

import styles from './ProjectPage.module.scss';

const ProjectPage = () => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const { data, isLoading } = useProjectsMeta();
  const showCreateBtn = !isLoading && (data?.totalCount ?? 0) > 0;

  return (
    <PageLayout
      title="Мои проекты"
      backPath={null}
      headerActions={isTablet && <ProjectControlsView />}
    >
      <PageLayout.LeftContent>
        {!isTablet && showCreateBtn && <CreateProjectBtn />}
      </PageLayout.LeftContent>
      <PageLayout.RightContent>
        {!isTablet && <ProjectControlsView />}
        {isTablet && showCreateBtn && <CreateProjectBtn />}
      </PageLayout.RightContent>

      <div className={styles.project}>
        <div className="container">
          <ProjectBoard isArchive={false} paginationMode={isTablet ? 'infinite' : 'pagination'} />
        </div>
      </div>
    </PageLayout>
  );
};

export default ProjectPage;
