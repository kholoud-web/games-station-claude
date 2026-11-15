'use client';

import { environmentManager, QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { makeQueryClient } from '@/lib/query/client';

let browserClient: QueryClient | undefined;

/** A new client per server request; one shared client in the browser, kept across suspense re-renders. */
function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) return makeQueryClient();
  browserClient ??= makeQueryClient();
  return browserClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
