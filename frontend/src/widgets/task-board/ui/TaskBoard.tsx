import { DragDropProvider } from '@dnd-kit/react';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { breakpoints } from 'app/styles/breakpoints';
import { GetColumnsResponce } from 'entities/column/api/columnApi';
import { ProjectModalContainer } from 'features/project';
import { ErrorState } from 'shared/ui';

import { useTaskBoard } from '../model/useTaskBoard';

import { TaskBoardDesktop } from './TaskBoardDesktop';
import { TaskBoardMobile } from './TaskBoardMobile';

type TProps = {
  dataQuery: UseInfiniteQueryResult<InfiniteData<GetColumnsResponce>>;
  enableDnD?: boolean;
  isArchive?: boolean;
};

export const TaskBoard = ({ enableDnD = true, dataQuery, isArchive = false }: TProps) => {
  const [modalProjectId, SetModalProjectId] = useState<number | null>(null);

  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });

  const { isDraggingTask, debouncedParams, handleDragEnd, handleDragStart } = useTaskBoard({
    enableDnD,
  });

  const { isError, refetch } = dataQuery;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {isMobile ? (
          <TaskBoardMobile
            dataQuery={dataQuery}
            params={debouncedParams}
            isArchive={isArchive}
            isDraggingTask={enableDnD ? isDraggingTask : undefined}
          />
        ) : (
          <TaskBoardDesktop
            onOpenProject={(project) => SetModalProjectId(project)}
            dataQuery={dataQuery}
            params={debouncedParams}
            isArchive={isArchive}
          />
        )}
      </DragDropProvider>

      {modalProjectId && (
        <ProjectModalContainer
          projectId={modalProjectId}
          isOpen={!!modalProjectId}
          onClose={() => SetModalProjectId(null)}
        />
      )}
    </>
  );
};
