import { renderHook, act } from '@testing-library/react';

import { mergeParams, parseParams } from 'shared/lib';

import { buildProjectParams } from './buildProjectParams';
import { initialProjectControls, ProjectControlsType } from './projectTypes';
import { useProjectControls } from './useProjectControls';

jest.mock('./buildProjectParams', () => ({
  buildProjectParams: jest.fn(),
}));

jest.mock('shared/lib/params', () => ({
  mergeParams: jest.fn(),
  parseParams: jest.fn(),
}));

describe('useProjectControls hook', () => {
  let params: URLSearchParams;
  let setParams: jest.Mock;

  beforeEach(() => {
    params = new URLSearchParams();
    setParams = jest.fn();

    (buildProjectParams as jest.Mock).mockImplementation(
      (controls: ProjectControlsType) => new URLSearchParams({ search: controls.search || '' }),
    );

    (mergeParams as jest.Mock).mockImplementation(
      (newParams: URLSearchParams, oldParams: URLSearchParams) => {
        const merged = new URLSearchParams(oldParams);
        newParams.forEach((value, key) => merged.set(key, value));
        return merged;
      },
    );

    (parseParams as jest.Mock).mockImplementation((params: URLSearchParams, _schema: any) => {
      return { ...initialProjectControls, search: params.get('search') || '' };
    });
  });

  test('инициализация с нужным значением search', () => {
    params.set('search', 'initial');
    const { result } = renderHook(() => useProjectControls(params, setParams));
    expect(result.current.controls.search).toBe('initial');
  });

  test('handleSearch обновляет поле search', () => {
    const { result } = renderHook(() => useProjectControls(params, setParams));

    act(() => {
      result.current.handleSearch('test');
    });

    expect(result.current.controls.search).toBe('test');
  });

  test('handleSort изменяет sort_by и переключает order', () => {
    const { result } = renderHook(() => useProjectControls(params, setParams));

    // Первое нажатие на поле 'created_at'
    act(() => {
      result.current.handleSort('updated_at');
    });
    expect(result.current.controls.sort_by).toBe('updated_at');
    expect(result.current.controls.order).toBe('asc');

    // Второе нажатие на то же поле
    act(() => {
      result.current.handleSort('updated_at');
    });
    expect(result.current.controls.order).toBe('desc');

    // Нажатие на другое поле 'title'
    act(() => {
      result.current.handleSort('title');
    });
    expect(result.current.controls.sort_by).toBe('title');
    expect(result.current.controls.order).toBe('asc');
  });

  test('handleApply вызывает setParams с merged params', () => {
    const { result } = renderHook(() => useProjectControls(params, setParams));

    // Сначала обновляем search
    act(() => {
      result.current.handleSearch('new search');
    });

    // Потом вызываем apply
    act(() => {
      result.current.handleApply();
    });

    expect(buildProjectParams).toHaveBeenCalledWith(result.current.controls);
    expect(mergeParams).toHaveBeenCalled();
    expect(setParams).toHaveBeenCalled();

    const mergedParams = setParams.mock.calls[0][0] as URLSearchParams;
    expect(mergedParams.get('search')).toBe('new search');
  });

  test('handleReset сбрасывает controls и сохраняет другие параметры', () => {
    params.set('other', 'value');
    const { result } = renderHook(() => useProjectControls(params, setParams));

    act(() => {
      result.current.handleSearch('changed');
      result.current.handleReset();
    });

    expect(result.current.controls).toEqual(initialProjectControls);

    const finalParams = setParams.mock.calls[0][0] as URLSearchParams;
    expect(finalParams.get('other')).toBe('value');
    for (const key of Object.keys(initialProjectControls)) {
      expect(finalParams.has(key)).toBe(false);
    }
  });
});
