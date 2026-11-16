import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { cn } from '@/lib/cn';

export type BreadcrumbItem = { label: string; href?: string };

/** The last item is the current page: never a link, even if it is given an href. */
export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const t = useTranslations('components.breadcrumb');

  return (
    <nav aria-label={t('label')} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`} className="flex items-center gap-2">
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(isLast && 'font-semibold text-text')}
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="rounded-sm hover:text-text">
                  {item.label}
                </Link>
              )}
              {isLast ? null : (
                <ChevronRight aria-hidden="true" className="size-3.5 rtl:rotate-180" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
