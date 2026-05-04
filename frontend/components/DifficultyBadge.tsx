import clsx from 'clsx';
import type { Difficulty } from '@/lib/types';

export function DifficultyBadge({ value }: { value: Difficulty }) {
  return (
    <span
      className={clsx({
        'badge-easy': value === 'Easy',
        'badge-medium': value === 'Medium',
        'badge-hard': value === 'Hard',
      })}
    >
      {value}
    </span>
  );
}
