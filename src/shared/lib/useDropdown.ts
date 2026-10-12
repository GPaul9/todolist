import {
  arrow,
  autoUpdate,
  offset,
  shift,
  Placement,
  Middleware,
  useFloating,
  useDismiss,
  useInteractions,
} from '@floating-ui/react';
import { useState } from 'react';

type TProps = {
  placement?: Placement;
  offsetValue?: number;
  middleware?: Middleware[];
  zIndex?: number;
};

export const useDropdown = ({
  placement = 'bottom',
  offsetValue = 8,
  middleware = [],
  zIndex = 200,
}: TProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(offsetValue), shift(), arrow({ element: arrowRef }), ...middleware],
  });

  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  return {
    isOpen,
    setIsOpen,
    refs,
    floatingStyles: {
      ...floatingStyles,
      zIndex,
    },
    getReferenceProps,
    getFloatingProps,
    arrowRef,
    setArrowRef,
  };
};
