import { useDroppable } from '@dnd-kit/react';
import clsx from 'clsx';
import { useEffect } from 'react';

import { Column } from 'entities/column';
import { useDropdown } from 'shared/lib';
import { ArchiveIconBtn, DeleteIconBtn, Input, Overlay } from 'shared/ui';

import { useColumnTab } from '../model/useColumnTab';

import styles from './ColumnTab.module.scss';

type TProps = {
  column: Column;
  isActive: boolean;
  onClick: () => void;
  onEdit: (status: boolean) => void;
};

export const ColumnTab = ({ column, isActive, onClick, onEdit }: TProps) => {
  // dragNdrop
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
  });
  // -----------------

  const {
    isArchived,
    isAnyPending,
    isEdit,
    title,
    setTitle,
    error,
    inputRef,
    startLongPress,
    cancelLongPress,
    handleClick,
    handleSave,
    handleDelete,
    handleArchive,
    handleCancel,
    handleUnArchive,
  } = useColumnTab({ column, onClick, onEdit });

  const { refs, floatingStyles, getReferenceProps, getFloatingProps } = useDropdown({
    offsetValue: 15,
    placement: 'top',
    zIndex: 170,
  });

  useEffect(() => {
    if (!isEdit) return;

    requestAnimationFrame(() => {
      const node = refs.reference.current;

      if (node instanceof HTMLElement) {
        node.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    });
  }, [isEdit, refs.reference]);

  return (
    <>
      {!isEdit && (
        <button
          ref={ref}
          className={clsx(
            styles.tab,
            isActive && styles.tab_active,
            isDropTarget && styles.tab_drop,
          )}
          onClick={handleClick}
          onPointerDown={startLongPress}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className={styles.tab__title}>{column.title}</span>
        </button>
      )}
      {isEdit && (
        <>
          <Overlay zIndex={160} onClick={handleSave} />
          <div
            ref={refs.setReference}
            className={styles['tab__input-wrapper']}
            {...getReferenceProps()}
          >
            {isArchived ? (
              <p className={styles['tab__title-view']}>{column.title}</p>
            ) : (
              <>
                <Input
                  name="column-title"
                  className={styles.tab__input}
                  classNameContainer={styles['tab__input-container']}
                  ref={inputRef}
                  status={error ? 'error' : undefined}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <div
                  className={clsx(
                    styles['tab__input-message'],
                    error && styles['tab__input-message_error'],
                  )}
                >
                  Введите от 3 до 100 символов
                </div>
              </>
            )}
          </div>
          <div
            className={styles.tab__actions}
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {isArchived && <DeleteIconBtn onClick={handleDelete} disabled={isAnyPending} />}
            <ArchiveIconBtn
              onClick={isArchived ? handleUnArchive : handleArchive}
              disabled={isAnyPending}
              isArchived={isArchived}
            />
          </div>
        </>
      )}
    </>
  );
};
