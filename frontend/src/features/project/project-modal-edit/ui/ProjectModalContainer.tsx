import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { useProjectById } from 'entities/project';
import { Modal } from 'shared/ui';

import { ProjectModalContent } from './ProjectModalContent';
import styles from './ProjectModalEdit.module.scss';
import { ProjectModalEditSkeleton } from './ProjectModalEditSkeleton';

type TProps = {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
};

export const ProjectModalContainer = ({ projectId, isOpen, onClose }: TProps) => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });

  const enabled = isOpen && projectId != null;

  const { data, isLoading } = useProjectById({
    projectId: projectId,
    enabled,
  });

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modal}
      onClose={onClose}
      modeX="right"
      modeY={isTablet ? 'bottom' : 'center'}
    >
      {isLoading && <ProjectModalEditSkeleton />}
      {!isLoading && data && <ProjectModalContent project={data} onClose={onClose} />}
    </Modal>
  );
};
