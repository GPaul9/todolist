import { ReactNode, useCallback, useRef, useState } from 'react';

import { DialogContext } from 'shared/lib/dialog/DialogContext';
import { AlertDialogOptions, ConfirmDialogOptions } from 'shared/lib/dialog/dialogTypes';
import { ConfirmModal, AlertModal } from 'shared/ui';

type ModalState =
  | { type: 'none' }
  | { type: 'confirm'; options: ConfirmDialogOptions }
  | { type: 'alert'; options: AlertDialogOptions };

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ModalState>({ type: 'none' });

  const confirmResolver = useRef<((value: boolean) => void) | null>(null);
  const alertResolver = useRef<(() => void) | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setState({ type: 'confirm', options });

    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
    });
  }, []);

  const alert = useCallback((options: AlertDialogOptions) => {
    setState({ type: 'alert', options });

    return new Promise<void>((resolve) => {
      alertResolver.current = resolve;
    });
  }, []);

  // confirm handlers
  const handleConfirmOk = () => {
    confirmResolver.current?.(true);
    confirmResolver.current = null;
    setState({ type: 'none' });
  };

  const handleConfirmCancel = () => {
    confirmResolver.current?.(false);
    confirmResolver.current = null;
    setState({ type: 'none' });
  };

  // alert handlers
  const handleAlertClose = () => {
    alertResolver.current?.();
    alertResolver.current = null;
    setState({ type: 'none' });
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      <ConfirmModal
        isOpen={state.type === 'confirm'}
        title={state.type === 'confirm' ? state.options.title : undefined}
        description={state.type === 'confirm' ? state.options.description : undefined}
        confirmText={state.type === 'confirm' ? state.options.confirmText : undefined}
        cancelText={state.type === 'confirm' ? state.options.cancelText : undefined}
        onConfirm={handleConfirmOk}
        onCancel={handleConfirmCancel}
      />

      <AlertModal
        isOpen={state.type === 'alert'}
        title={state.type === 'alert' ? state.options.title : undefined}
        description={state.type === 'alert' ? state.options.description : undefined}
        confirmText={state.type === 'alert' ? state.options.confirmText : undefined}
        onConfirm={handleAlertClose}
      />
    </DialogContext.Provider>
  );
};
