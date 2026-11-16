import { z } from 'zod';

// Zod 4 probes `new Function("")` once to decide whether it may compile fast parsers. Our
// Content-Security-Policy forbids 'unsafe-eval', so the probe throws (and is caught), but the
// browser still reports a securitypolicyviolation on every page. `jitless` skips the probe and
// uses Zod's interpreter. Cost: slower parsing of very large objects; our forms are small.
//
// Every module imports `z` from here, never from 'zod', so the setting runs before any schema is
// built (pinned by tests/lib/zod-setup.test.ts). next.config.ts cannot use the `@/` alias, so
// src/lib/env.ts imports this file by relative path.
z.config({ jitless: true });

export { z };
