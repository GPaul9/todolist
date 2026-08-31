import { useEffect, useState } from 'react';

import { Project, useProjectActions } from 'entities/project';

type TProps = {
  project: Project;
  onClose: () => void;
};

export const useProjectModalEdit = ({ project, onClose }: TProps) => {
  const [draft, setDraft] = useState<Project>(project);
  const { actions, isPending } = useProjectActions();

  useEffect(() => {
    setDraft(project);
  }, [project]);

  const handleSetDraft = <K extends keyof Project>(key: K, value: Project[K]) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const handleSave = () => {
    const isChanged = project.title !== draft.title || project.description !== draft.description;

    if (!isChanged) return onClose();

    const updateData: Pick<Project, 'title' | 'description'> = {
      title: draft.title,
      description: draft.description || null,
    };

    actions.update({ projectId: project.id, data: updateData }).then(() => onClose());
  };

  const handleCancel = () => {
    onClose();
  };

  return { draft, isPending, handleSetDraft, handleSave, handleCancel };
};
