import { useContext } from 'react';

import { DialogContext } from './DialogContext';

export const useDialog = () => {
  const dialog = useContext(DialogContext);

  if (!dialog) {
    throw new Error('useDialog need DialogProvider');
  }

  return dialog;
};
