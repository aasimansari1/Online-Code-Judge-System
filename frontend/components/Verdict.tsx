import clsx from 'clsx';
import { Check, X, Clock, AlertTriangle, FileWarning, HelpCircle } from 'lucide-react';

const STYLES: Record<string, { cls: string; Icon: typeof Check }> = {
  Accepted: { cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', Icon: Check },
  'Wrong Answer': { cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', Icon: X },
  'Time Limit Exceeded': { cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', Icon: Clock },
  'Compilation Error': { cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', Icon: FileWarning },
  'Runtime Error': { cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', Icon: AlertTriangle },
};

export function Verdict({ value, className }: { value: string; className?: string }) {
  const style = STYLES[value] || { cls: 'bg-bg-subtle text-fg-muted', Icon: HelpCircle };
  const { Icon } = style;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold',
        style.cls,
        className,
      )}
    >
      <Icon size={13} />
      {value}
    </span>
  );
}
