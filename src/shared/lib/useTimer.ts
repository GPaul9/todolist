import { useCallback, useEffect, useRef, useState } from 'react';

type UseTimerProps = {
  storageKey: string;
  onFinish?: () => void;
};

export const useTimer = ({ storageKey, onFinish }: UseTimerProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clear();
    endTimeRef.current = null;
    setTime(0);
    setIsRunning(false);
    localStorage.removeItem(storageKey);
  }, [clear, storageKey]);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;

    const remain = Math.ceil((endTimeRef.current - Date.now()) / 1000);

    if (remain <= 0) {
      stop();
      onFinish?.();
      return;
    }

    setTime(remain);
  }, [stop, onFinish]);

  const start = useCallback(
    (seconds: number) => {
      clear();

      const endTime = Date.now() + seconds * 1000;

      endTimeRef.current = endTime;
      localStorage.setItem(storageKey, String(endTime));

      setTime(seconds);
      setIsRunning(true);

      intervalRef.current = setInterval(tick, 1000);
    },
    [clear, storageKey, tick],
  );

  // восстановление после reload
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (!saved) return;

    const remain = Math.ceil((Number(saved) - Date.now()) / 1000);

    if (remain <= 0) {
      localStorage.removeItem(storageKey);
      return;
    }

    endTimeRef.current = Number(saved);
    setTime(remain);
    setIsRunning(true);

    intervalRef.current = setInterval(tick, 1000);

    return clear;
  }, [storageKey, tick, clear]);

  return {
    time,
    isRunning,
    start,
    stop,
  };
};
