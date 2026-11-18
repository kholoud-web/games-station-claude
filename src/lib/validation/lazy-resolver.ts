import type { FieldValues, Resolver } from 'react-hook-form';
import type { z } from '@/lib/zod';

/**
 * A react-hook-form resolver that loads Zod and the schema on first use. Zod is about 90 KB gzip,
 * so forms that sit on every page (the footer newsletter) must not pull it into the shared bundle.
 * The cost is one chunk request on the first submit; the submit button shows its loading state
 * meanwhile. `import type` is erased at build time, so nothing here loads Zod eagerly.
 *
 * The schema's input type must be the form's values (`T`), which the call site checks.
 */
export function lazyZodResolver<T extends FieldValues>(loadSchema: () => Promise<z.ZodType<unknown, T>>): Resolver<T> {
  return async (values, context, options) => {
    const [{ zodResolver }, schema] = await Promise.all([import('@hookform/resolvers/zod'), loadSchema()]);
    // The library's overloads cannot carry our `T` through; the input type above is what ties them.
    const resolve = zodResolver(schema) as unknown as Resolver<T>;
    return resolve(values, context, options);
  };
}
