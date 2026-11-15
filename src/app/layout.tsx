import type { ReactNode } from 'react';

// The <html> element lives in app/[locale]/layout.tsx so lang and dir follow the URL locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
