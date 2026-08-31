import { DatePicker, Button } from 'shared/ui';
import { usePickerMobile } from '../model/usePickerMobile';
import styles from './TaskModalDatesMobile.module.scss';

interface TProps {
  value: string;
  onNext: (date: string) => void;
  disablePastDates?: boolean;
}

export const TaskModalPickerMobile = ({ value, onNext, disablePastDates = false }: TProps) => {
  const { draftDate, setDraftDate, handleNextClick } = usePickerMobile({ value, onNext });

  return (
    <div className={styles.picker}>
      <DatePicker
        mode="single"
        selected={draftDate}
        setSelected={setDraftDate}
        disablePastDates={disablePastDates}
      />

      <Button
        kind="primary"
        className={styles.picker__btn}
        disabled={!draftDate}
        onClick={handleNextClick}
      >
        Далее
      </Button>
    </div>
  );
};
