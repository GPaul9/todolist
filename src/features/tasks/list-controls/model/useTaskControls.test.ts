import { renderHook, act } from '@testing-library/react';
import { DateRange } from 'react-day-picker';

import { mergeParams, parseParams } from 'shared/lib/params';

import { buildTaskParams } from './buildTaskParams';
import { initialTaskControls, TaskControlsType } from './taskTypes';
import { useTaskControls } from './useTaskControls';

jest.mock('./buildTaskParams', () => ({
  buildTaskParams: jest.fn(),
}));

jest.mock('shared/lib/params', () => ({
  mergeParams: jest.fn(),
  parseParams: jest.fn(),
}));

describe('useTaskControls hook', () => {
  let params: URLSearchParams;
  let setParams: jest.Mock;

  beforeEach(() => {
    params = new URLSearchParams();
    setParams = jest.fn();

    (buildTaskParams as jest.Mock).mockImplementation(
      (controls: TaskControlsType) => new URLSearchParams({ search: controls.search || '' }),
    );

    (mergeParams as jest.Mock).mockImplementation(
      (newParams: URLSearchParams, oldParams: URLSearchParams) => {
        const merged = new URLSearchParams(oldParams);
        newParams.forEach((value, key) => merged.set(key, value));
        return merged;
      },
    );

    (parseParams as jest.Mock).mockImplementation((params: URLSearchParams, _schema: any) => {
      return { ...initialTaskControls, search: params.get('search') || '' };
    });
  });

  test('инициализация с нужным значением search', () => {
    params.set('search', 'initial');
    const { result } = renderHook(() => useTaskControls(params, setParams));
    expect(result.current.controls.search).toBe('initial');
  });

  test('handleSearch обновляет поле search', () => {
    const { result } = renderHook(() => useTaskControls(params, setParams));
    act(() => result.current.handleSearch('test'));
    expect(result.current.controls.search).toBe('test');
  });

  test('handleSort изменяет sort_by и переключает order', () => {
    const { result } = renderHook(() => useTaskControls(params, setParams));

    // Первое нажатие
    act(() => result.current.handleSort('deadline'));
    expect(result.current.controls.sort_by).toBe('deadline');
    expect(['asc', 'desc']).toContain(result.current.controls.order);

    // Второе нажатие на то же поле
    const firstOrder = result.current.controls.order;
    act(() => result.current.handleSort('deadline'));
    expect(result.current.controls.order).toBe(firstOrder === 'asc' ? 'desc' : 'asc');

    // Нажатие на другое поле
    act(() => result.current.handleSort('title'));
    expect(result.current.controls.sort_by).toBe('title');
    expect(result.current.controls.order).toBe('asc');
  });

  test('handleApply вызывает setParams с merged params', () => {
    const { result } = renderHook(() => useTaskControls(params, setParams));
    act(() => result.current.handleSearch('new search'));
    act(() => result.current.handleApply());

    expect(buildTaskParams).toHaveBeenCalledWith(result.current.controls);
    expect(mergeParams).toHaveBeenCalled();
    expect(setParams).toHaveBeenCalled();

    const mergedParams = setParams.mock.calls[0][0] as URLSearchParams;
    expect(mergedParams.get('search')).toBe('new search');
  });

  test('handleFilter добавляет и убирает значения', () => {
    const { result } = renderHook(() => useTaskControls(params, setParams));
    act(() => result.current.handleFilter('priority', 'low', true));
    expect(result.current.controls.priority).toContain('low');
    act(() => result.current.handleFilter('priority', 'low', false));
    expect(result.current.controls.priority).not.toContain('low');
  });

  test('handleDate устанавливает диапазон', () => {
    const { result } = renderHook(() => useTaskControls(params, setParams));
    const range: DateRange = { from: new Date('2026-04-01'), to: new Date('2026-04-03') };
    act(() => result.current.handleDate(range));
    expect(result.current.controls.date_from).toEqual(range.from);
    expect(result.current.controls.date_to).toEqual(range.to);
  });

  test('handleReset сбрасывает controls и сохраняет другие параметры', () => {
    params.set('other', 'value');
    const { result } = renderHook(() => useTaskControls(params, setParams));

    act(() => result.current.handleSearch('changed'));
    act(() => result.current.handleReset());

    expect(result.current.controls).toEqual(initialTaskControls);

    const finalParams = setParams.mock.calls[0][0] as URLSearchParams;
    expect(finalParams.get('other')).toBe('value');
    for (const key of Object.keys(initialTaskControls)) {
      expect(finalParams.has(key)).toBe(false);
    }
  });
});
