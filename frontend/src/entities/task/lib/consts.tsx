import { ComponentType, SVGProps } from 'react';

import HighPriorityIcon from 'assets/priority-high-icon.svg?react';
import LowPriorityIcon from 'assets/priority-low-icon.svg?react';
import MediumPriorityIcon from 'assets/priority-medium-icon.svg?react';

import { Status, Priority } from '../model/types/tasks';

export const STATUS_MAP: Record<Status, { label: string }> = {
  todo: { label: 'Запланирована' },
  in_progress: { label: 'В работе' },
  done: { label: 'Завершена' },
};

export const PRIORITY_MAP: Record<
  Priority,
  { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  high: { label: 'Высокий', icon: HighPriorityIcon },
  medium: { label: 'Средний', icon: MediumPriorityIcon },
  low: { label: 'Низкий', icon: LowPriorityIcon },
};
