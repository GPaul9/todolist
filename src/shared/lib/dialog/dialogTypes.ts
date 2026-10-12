import { ReactNode } from 'react';

export type ConfirmDialogOptions = {
  title?: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
};

export type AlertDialogOptions = {
  title?: string;
  description: string | ReactNode;
  confirmText?: string;
};
