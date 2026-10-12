import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { dismissNotice, notice } from 'shared/ui';

import { useArchiveProject } from '../hooks/useProjects';
import { Project } from '../types/project';

export const useSuggestArchiveProject = (project?: Project) => {
  const wasShownRef = useRef(false);
  const navigate = useNavigate();

  const { mutate, isSuccess } = useArchiveProject();

  useEffect(() => {
    if (isSuccess) {
      navigate('/project');
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (!project) return;

    const isCompleted = project.total_tasks > 0 && project.completed_tasks === project.total_tasks;

    const shouldSuggest = isCompleted && project.status === 'active';

    if (!shouldSuggest) return;

    if (wasShownRef.current) return;

    wasShownRef.current = true;

    notice.suggestComplete({
      title: 'Проект завершён!',
      message: 'Вы можете перенести проект в архив.',
      onClick: (toastId) =>
        mutate(project.id, {
          onSuccess: () => {
            dismissNotice(toastId);
            navigate('/project');
          },
        }),
    });
  }, [project, mutate, navigate]);
};
