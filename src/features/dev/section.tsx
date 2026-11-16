import { useId, type ReactNode } from 'react';

/** A named region of the showcase page; the heading gives the region its accessible name. */
export function ShowcaseSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="space-y-1">
        <h2 id={headingId} className="text-xl font-bold text-text">
          {title}
        </h2>
        {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

/** One labelled example inside a section. */
export function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">{label}</p>
      {children}
    </div>
  );
}
