import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  autoUpdate,
  Placement,
  FloatingPortal,
} from '@floating-ui/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';

import { tooltip } from 'shared/lib';

import styles from './Tooltip.module.scss';

type Props = {
  content: string | ReactNode;
  placement?: Placement;
  withArrow?: boolean;
  zIndex?: number;
  disabled?: boolean;
  mode?: 'default' | 'primary';
  children: React.ReactNode;
};

export const Tooltip = ({
  content,
  placement = 'bottom',
  withArrow = true,
  zIndex = 10,
  disabled = false,
  mode = 'default',
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    placement,
    middleware: [
      offset(withArrow ? 10 : 6),
      flip(),
      shift({ padding: 4 }),
      arrow({
        element: arrowRef,
        padding: 4,
      }),
    ],
  });

  const hover = useHover(context, {
    delay: {
      open: 500,
      close: 400,
    },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const { x, y } = context.middlewareData.arrow ?? {};

  return (
    <span className={styles.tooltip}>
      <div
        className={styles.tooltip__trigger}
        ref={refs.setReference}
        {...getReferenceProps({
          onPointerDown: () => setIsPressed(true),
          onPointerUp: () => setIsPressed(false),
          onPointerCancel: () => setIsPressed(false),
          onPointerLeave: () => setIsPressed(false),
        })}
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex }}
              {...getFloatingProps()}
            >
              <motion.div
                className={clsx(
                  styles.tooltip__hint,
                  mode === 'primary' && styles.tooltip__hint_primary,
                  isPressed && styles.tooltip__hint_active,
                  disabled && styles.tooltip__hint_disabled,
                )}
                variants={tooltip}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {content}

                {withArrow && (
                  <div
                    className={clsx(
                      styles.tooltip__arrow,
                      mode === 'primary' && styles.tooltip__arrow_primary,
                      isPressed && styles.tooltip__arrow_active,
                    )}
                    data-side={context.placement.split('-')[0]}
                    ref={arrowRef}
                    style={{
                      left: x ?? '',
                      top: y ?? '',
                    }}
                  />
                )}
              </motion.div>
            </div>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </span>
  );
};
