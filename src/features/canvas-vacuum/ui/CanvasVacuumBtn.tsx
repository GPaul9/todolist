import styles from './CanvasVacuumBtn.module.scss';
import carIcon from 'assets/canvasVacuum/car1.webp';
import CrossIcon from 'assets/cross-icon.svg?react';

type TProps = {
  onOpen: () => void;
  onClose: () => void;
}

export const CanvasVacuumBtn = ({onClose, onOpen}: TProps) => {
  return (
    <div className={styles.vacuum}>
      <button
        className={styles.vacuum__trigger}
        onClick={onOpen}
      >
        <img className={styles.vacuum__img} src={carIcon} alt="Vacuum Game" />
      </button>

      <button
        className={styles['vacuum__trigger-close']}
        onClick={onClose}
      >
        <CrossIcon className={styles.vacuum__icon} />
      </button>
    </div>
  )
};
