import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { useGetAllColumns } from 'entities/column';
import { ArchiveMode, BoardSwitcher } from 'features/archive';
import {
  PageLayout,
  ProjectBoard,
  ProjectControlsView,
  TaskBoard,
  TaskControlsView,
} from 'widgets';

import styles from './ArchivePage.module.scss';

const ArchivePage = () => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const [mode, setMode] = useState<ArchiveMode>('project');

  const columnsQuery = useGetAllColumns({ statuses: ['archived_by_user'] });

  return (
    <PageLayout
      title="Архив"
      headerActions={
        isTablet && mode === 'project' ? <ProjectControlsView /> : <TaskControlsView />
      }
    >
      <PageLayout.LeftContent>
        <BoardSwitcher mode={mode} onChange={(value) => setMode(value)} />
      </PageLayout.LeftContent>
      <PageLayout.RightContent>
        {!isTablet && (mode === 'project' ? <ProjectControlsView /> : <TaskControlsView />)}
      </PageLayout.RightContent>

      <div className={styles.archive}>
        <div className="container">
          {mode === 'project' && (
            <ProjectBoard isArchive={true} paginationMode={isTablet ? 'infinite' : 'pagination'} />
          )}
          {mode === 'column' && (
            <TaskBoard enableDnD={false} dataQuery={columnsQuery} isArchive={true} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ArchivePage;
