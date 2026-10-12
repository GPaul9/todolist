import { AlertDialogOptions } from 'shared/lib/dialog/dialogTypes';

import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';

import styles from './DialogModal.module.scss';

type TProps = AlertDialogOptions & {
  isOpen: boolean;
  onConfirm: () => void;
};

export const AlertModal = ({
  isOpen,
  title,
  description,
  confirmText = 'Закрыть',
  onConfirm,
}: TProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onConfirm}>
      <div className={styles.dialog}>
        {title && <h3 className={styles.dialog__title}>{title}</h3>}

        <div className={styles.dialog__descr}>{description}</div>

        <div className={styles.dialog__buttons}>
          <Button className={styles.dialog__btn} kind="secondary" type="button" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
