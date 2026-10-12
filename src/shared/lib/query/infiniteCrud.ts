import { InfiniteData } from '@tanstack/react-query';

type DataPage<T> = {
  data: T[];
};

export const normalizeInfiniteData = <T>(data?: InfiniteData<DataPage<T>>): T[] => {
  return data?.pages.flatMap((page) => page.data) ?? [];
};

export function updateInfiniteItem<T extends { id: number }>(
  oldData: InfiniteData<any> | undefined,
  updatedItem: T,
): InfiniteData<any> | undefined {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((item: T) => (item.id === updatedItem.id ? updatedItem : item)),
    })),
  };
}

export function prependInfiniteItem<T>(
  oldData: InfiniteData<any> | undefined,
  newItem: T,
): InfiniteData<any> | undefined {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: [
      {
        ...oldData.pages[0],
        data: [newItem, ...oldData.pages[0].data],
      },
      ...oldData.pages.slice(1),
    ],
  };
}

export function removeInfiniteItem<T extends { id: number }>(
  oldData: InfiniteData<any> | undefined,
  id: number,
): InfiniteData<any> | undefined {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.filter((item: T) => item.id !== id),
    })),
  };
}
