import { renderHook, act } from '@testing-library/react';

import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('starts with provided seconds', () => {
    const { result } = renderHook(() => useTimer({ storageKey: 'timer', seconds: 10 }));

    expect(result.current).toBe(10);
  });

  test('timer decreases every second', () => {
    const { result } = renderHook(() => useTimer({ storageKey: 'timer', seconds: 10 }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(9);
  });

  test('calls onFinish when timer ends', () => {
    const onFinish = jest.fn();

    const { result } = renderHook(() => useTimer({ storageKey: 'timer', seconds: 2, onFinish }));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('removes key from localStorage when timer finishes', () => {
    renderHook(() => useTimer({ storageKey: 'timer', seconds: 1 }));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(localStorage.getItem('timer')).toBeNull();
  });

  test('restores timer from localStorage if not expired', () => {
    const endTime = Date.now() + 5000;
    localStorage.setItem('timer', String(endTime));

    const { result } = renderHook(() => useTimer({ storageKey: 'timer', seconds: 10 }));

    expect(result.current).toBeGreaterThan(0);
  });
});
