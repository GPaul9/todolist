import { ReactNode } from 'react';
import { toast, Id } from 'react-toastify';

import styles from './Notice.module.scss';
import { SuggestProps, SuggestToast } from './toasts/SuggestToast';
import { Toast } from './toasts/Toast';

export const dismissNotice = (toastId: Id) => toast.dismiss(toastId);

const showToast = (content: ReactNode, toastId: Id) => {
  return toast(content, {
    toastId: toastId,
    className: styles.notice,
    closeButton: false,
    hideProgressBar: true,
    autoClose: 3000,
    pauseOnHover: true,
    closeOnClick: true,
  });
};
const showSuggestToast = (content: ReactNode, toastId: Id) => {
  return toast(content, {
    toastId: toastId,
    className: styles.notice,
    closeButton: false,
    progressClassName: styles.notice__progress,
    autoClose: 6000,
    pauseOnHover: true,
    closeOnClick: false,
  });
};

type NoticeHandlers = {
  success: (message: string) => void;
  error: (message: string) => void;
  suggestComplete: (props: SuggestProps) => void;
};

export const notice: NoticeHandlers = {
  success: (message) => showToast(<Toast type="success" message={message} />, `success-${message}`),

  error: (message) => showToast(<Toast type="error" message={message} />, `error-${message}`),

  suggestComplete: ({ message, title, onClick }) => {
    const id = `suggestComplete-${message}`;
    return showSuggestToast(
      <SuggestToast
        toastId={id}
        type="suggestComplete"
        message={message}
        title={title}
        onClick={() => onClick(id)}
      />,
      id,
    );
  },
};
