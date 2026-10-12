import { ConfirmDialogOptions } from 'shared/lib/dialog/dialogTypes';

import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';

import styles from './DialogModal.module.scss';

type TProps = ConfirmDialogOptions & {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
}: TProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className={styles.dialog}>
        {title && <h3 className={styles.dialog__title}>{title}</h3>}

        <div className={styles.dialog__descr}>{description}</div>

        <div className={styles.dialog__buttons}>
          <Button className={styles.dialog__btn} kind="primary" type="button" onClick={onConfirm}>
            {confirmText}
          </Button>

          <Button className={styles.dialog__btn} kind="secondary" type="button" onClick={onCancel}>
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
