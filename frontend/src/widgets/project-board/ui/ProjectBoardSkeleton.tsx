import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { ProjectList } from 'features/project';
import { ProjectCardSkeleton } from 'features/project/project-card/ui/ProjectCardSkeleton';

import styles from './ProjectBoard.module.scss';

export const ProjectBoardSkeleton = () => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });
  const isMobile = useMediaQuery({ maxWidth: breakpoints.md });

  let countItem = 9;
  if (isTablet) countItem = 8;
  if (isMobile) countItem = 4;

  return (
    <div className={styles.board}>
      <ProjectList data={Array.from({ length: countItem })} getKey={(_, index) => index}>
        {() => <ProjectCardSkeleton />}
      </ProjectList>
    </div>
  );
};
