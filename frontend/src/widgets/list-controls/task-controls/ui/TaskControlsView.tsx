import { useMediaQuery } from 'react-responsive';
import { useSearchParams } from 'react-router-dom';

import { breakpoints } from 'app/styles/breakpoints';
import { TaskControls } from 'features/tasks';

import { ListControls } from '../../general-controls/ui/ListControls';
import { ListControlsMobile } from '../../general-controls/ui/ListControlsMobile';

export const TaskControlsView = () => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      {isTablet ? (
        <ListControlsMobile>
          {(handleClose) => (
            <TaskControls params={searchParams} setParams={setSearchParams} onClose={handleClose} />
          )}
        </ListControlsMobile>
      ) : (
        <ListControls>
          {(handleClose) => (
            <TaskControls params={searchParams} setParams={setSearchParams} onClose={handleClose} />
          )}
        </ListControls>
      )}
    </>
  );
};
