import { RefObject, useEffect } from 'react';

interface TProps {
  isOpen: boolean;
  hasError?: boolean;
  targetRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onClearError?: () => void;
}

export const useOverlayClose = ({ isOpen, hasError = false, targetRef, onClose, onClearError, }: TProps) => {
  useEffect(() => {
    if (!isOpen && !hasError) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (isOpen) onClose();
        if(hasError) onClearError?.();
      }
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;

      if(!isOpen && hasError) {
        onClearError?.();
        return;
      }

      if (targetRef.current && !targetRef.current.contains(target)) {
        onClose();
        if (hasError) onClearError?.();
      }
    };

    document.addEventListener('keydown', handleEsc, true);
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('keydown', handleEsc, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    };
  }, [isOpen, hasError, targetRef, onClose, onClearError]);
};
