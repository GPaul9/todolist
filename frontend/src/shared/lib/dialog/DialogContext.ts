import { createContext } from 'react';

import { AlertDialogOptions, ConfirmDialogOptions } from './dialogTypes';

export type DialogContextType = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  alert: (options: AlertDialogOptions) => Promise<void>;
};

export const DialogContext = createContext<DialogContextType | null>(null);
