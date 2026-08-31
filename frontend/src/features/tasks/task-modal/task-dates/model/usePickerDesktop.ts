import dayjs from 'dayjs';

import { useState } from 'react';

import { formatLocalTime } from 'shared/lib';

type TProps = {
  value: string | null;
  onSave: (newValue: string) => void;
  disablePastDates?: boolean;
};

export const usePickerDesktop = ({ value, onSave, disablePastDates }: TProps) => {
  const initialDate = value ? new Date(value) : undefined;
  const initialTime = initialDate ? formatLocalTime(initialDate) : '12:00';

  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState(initialTime);

  const currentTime = dayjs().format('HH:mm');

  const isToday = date && dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');

  const isPastTime =
    isToday &&
    (() => {
      const [h1, m1] = time.split(':').map(Number);
      const [h2, m2] = currentTime.split(':').map(Number);
      return h1 < h2 || (h1 === h2 && m1 < m2);
    })();

  //  const isPastTime = false;

  const handleApply = () => {
    if (!date) return;

    const formattedDate = dayjs(date).format('YYYY-MM-DD');

    const isoDateTime = dayjs(`${formattedDate}T${time}`).toISOString();
    onSave(isoDateTime);
  };

  const handleReset = () => {
    setDate(undefined);
  };

  return {
    date,
    setDate,
    time,
    setTime,
    isPastTime,
    handleApply,
    handleReset,
  };
};
