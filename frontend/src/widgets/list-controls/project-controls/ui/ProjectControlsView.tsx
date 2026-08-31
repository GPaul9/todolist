import { useMediaQuery } from 'react-responsive';
import { useSearchParams } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import { ProjectControls } from 'features/project';

import { ListControls } from '../../general-controls/ui/ListControls';
import { ListControlsMobile } from '../../general-controls/ui/ListControlsMobile';

export const ProjectControlsView = () => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      {isTablet ? (
        <ListControlsMobile>
          {(handleClose) => (
            <ProjectControls
              params={searchParams}
              setParams={setSearchParams}
              onClose={handleClose}
            />
          )}
        </ListControlsMobile>
      ) : (
        <ListControls>
          {(handleClose) => (
            <ProjectControls
              params={searchParams}
              setParams={setSearchParams}
              onClose={handleClose}
            />
          )}
        </ListControls>
      )}
    </>
  );
};
