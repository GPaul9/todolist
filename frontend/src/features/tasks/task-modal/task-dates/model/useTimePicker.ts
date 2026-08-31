import { useState } from 'react';

const ITEM_HEIGHT = 32;
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export const useTimePicker = () => {
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');

  const handleScroll = (
    e: React.UIEvent<HTMLDivElement>,
    list: string[],
    setVal: (v: string) => void,
  ) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    if (list[index] && list[index] !== hour && list[index] !== minute) {
      setVal(list[index]);
    }
  };

  return {
    hour,
    setHour,
    minute,
    setMinute,
    hoursList: HOURS,
    minutesList: MINUTES,
    handleScroll,
  };
};
