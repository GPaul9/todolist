export function prependArrayItem<T>(oldData: T[] | undefined, newItem: T): T[] {
  return oldData ? [newItem, ...oldData] : [newItem];
}

export function updateArrayItem<T extends { id: number }>(
  oldData: T[] | undefined,
  updatedItem: T,
): T[] | undefined {
  if (!oldData) return oldData;

  return oldData.map((item) => (item.id === updatedItem.id ? updatedItem : item));
}

export function removeArrayItem<T extends { id: string | number }>(
  oldData: T[] | undefined,
  id: T['id'],
): T[] | undefined {
  if (!oldData) return oldData;

  return oldData.filter((item) => item.id !== id);
}
