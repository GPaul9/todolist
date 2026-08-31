import { useEffect, useState } from 'react';

interface TProps {
  value: string;
  onNext: (date: string) => void;
}

export const usePickerMobile = ({ value, onNext }: TProps) => {
  const initialDate = value ? new Date(value) : undefined;

  const [draftDate, setDraftDate] = useState<Date | undefined>(initialDate);

  useEffect(() => {
    setDraftDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleNextClick = () => {
    if (draftDate) {
      const year = draftDate.getFullYear();
      const month = String(draftDate.getMonth() + 1).padStart(2, '0');
      const day = String(draftDate.getDate()).padStart(2, '0');

      onNext(`${year}-${month}-${day}`);
    }
  };

   return {
    draftDate,
    setDraftDate,
    handleNextClick,
  };
};
