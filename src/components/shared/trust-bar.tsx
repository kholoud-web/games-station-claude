import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

export type TrustItem = { icon: LucideIcon; title: string; description: string };

/** Short reassurance points (warranty, delivery, secure payment). Text arrives already translated. */
export function TrustBar({ items, className }: { items: TrustItem[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        'grid gap-4 rounded-card border border-border bg-card p-4 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]',
        className,
      )}
    >
      {items.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex flex-col items-center gap-1.5 text-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-cyan/10 text-cyan">
            <Icon aria-hidden="true" className="size-4.5" />
          </span>
          <span className="text-sm font-semibold text-text">{title}</span>
          <span className="text-xs text-muted">{description}</span>
        </li>
      ))}
    </ul>
  );
}
