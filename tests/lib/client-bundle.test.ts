import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Zod is about 90 KB gzip. It belongs to the pages that validate input, not to the shared client
 * code every page downloads. This follows STATIC imports (dynamic import() is a separate chunk that
 * loads on demand, and `import type` is erased) from the shared entry points and reports any path
 * that reaches 'zod'.
 */
const SRC = resolve(process.cwd(), 'src');
const STATIC_IMPORT = /(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]/g;

function resolveLocal(spec: string, from: string): string | null {
  const base = spec.startsWith('@/') ? resolve(SRC, spec.slice(2)) : resolve(dirname(from), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(candidate) && /\.(ts|tsx)$/.test(candidate)) return candidate;
  }
  return null;
}

/** The chain of files from `entry` to a static `import 'zod'`, or [] when there is none. */
function pathToZod(entry: string): string[] {
  const start = resolve(SRC, entry);
  const parent = new Map<string, string | null>([[start, null]]);
  const queue = [start];
  while (queue.length > 0) {
    const file = queue.shift() as string;
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(STATIC_IMPORT)) {
      const [, , typeOnly, spec] = match;
      if (typeOnly || !spec) continue;
      if (spec === 'zod') {
        const chain = [file];
        for (let p = parent.get(file); p; p = parent.get(p)) chain.unshift(p);
        return chain.map((f) => f.replace(`${SRC}/`, 'src/'));
      }
      if (!spec.startsWith('@/') && !spec.startsWith('.')) continue;
      const next = resolveLocal(spec, file);
      if (next && !parent.has(next)) {
        parent.set(next, file);
        queue.push(next);
      }
    }
  }
  return [];
}

describe('shared client code does not statically import zod', () => {
  it('canary: the walker does find zod where it is imported', () => {
    expect(pathToZod('lib/validation/schemas.ts').at(-1)).toBe('src/lib/zod.ts');
  });

  it.each([
    ['the locale layout, which every page renders', 'app/[locale]/layout.tsx'],
    ['the footer newsletter form', 'components/layout/footer.tsx'],
    ['the cart store, restored on every page', 'stores/cart-store.ts'],
    ['the services the data hooks call', 'services/index.ts'],
    ['the payment hook', 'features/checkout/use-payment-attempt.ts'],
  ])('%s', (_label, entry) => {
    expect(pathToZod(entry)).toEqual([]);
  });
});
