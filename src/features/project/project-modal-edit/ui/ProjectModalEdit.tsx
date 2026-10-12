import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { Project } from 'entities/project';
import { Modal } from 'shared/ui';

import { ProjectModalContent } from './ProjectModalContent';
import styles from './ProjectModalEdit.module.scss';
import { modal, modalMobile } from 'shared/lib';

type TProps = {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
};

export const ProjectModalEdit = ({ project, isOpen, onClose }: TProps) => {
  const isTablet = useMediaQuery({ maxWidth: breakpoints.lg });
  const isMobile = useMediaQuery({ maxWidth: breakpoints.md });

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modal}
      onClose={onClose}
      modeX="right"
      modeY={isTablet ? 'bottom' : 'center'}
      variants={isMobile ? modalMobile : modal}
    >
      <ProjectModalContent project={project} onClose={onClose} />
    </Modal>
  );
};
