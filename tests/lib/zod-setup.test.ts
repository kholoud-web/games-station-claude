import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('zod under a strict Content-Security-Policy', () => {
  it('never probes for eval, which the browser reports as a CSP violation on every page', async () => {
    // Zod's JIT probe is `new Function("")` in a try/catch. Under our policy (no 'unsafe-eval') the
    // throw is swallowed, but the browser still fires a securitypolicyviolation event. The probe
    // is a construct call, so both traps are needed: `apply` alone never sees it.
    const RealFunction = globalThis.Function;
    let probes = 0;
    const count = (args: unknown[]) => {
      if (args.length === 1 && args[0] === '') probes += 1;
    };
    globalThis.Function = new Proxy(RealFunction, {
      apply(target, thisArg, args: unknown[]) {
        count(args);
        return Reflect.apply(target, thisArg, args);
      },
      construct(target, args: unknown[], newTarget) {
        count(args);
        return Reflect.construct(target, args, newTarget);
      },
    });
    try {
      const { newsletterSchema } = await import('@/lib/validation/schemas');
      const { parseEnv } = await import('@/lib/env');
      expect(newsletterSchema.safeParse({ email: 'gamer@example.com' }).success).toBe(true);
      expect(parseEnv({}).NEXT_PUBLIC_MOCK_LATENCY_MS).toBe(150);
    } finally {
      globalThis.Function = RealFunction;
    }
    expect(probes).toBe(0);
  });

  it('is configured once, in src/lib/zod.ts', async () => {
    const { z } = await import('@/lib/zod');
    expect(z.config().jitless).toBe(true);
  });

  it('is imported only through src/lib/zod.ts, so no schema can skip the setup', () => {
    const root = join(process.cwd(), 'src');
    const offenders = sourceFiles(root)
      .filter((file) => relative(root, file) !== join('lib', 'zod.ts'))
      .filter((file) => /from\s+['"]zod(\/[^'"]*)?['"]/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(root, file));
    expect(offenders).toEqual([]);
  });
});
