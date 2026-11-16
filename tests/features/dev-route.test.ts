import { describe, expect, it } from 'vitest';

import { isDevRouteEnabled } from '@/features/dev/dev-route';

describe('isDevRouteEnabled', () => {
  it('is on while developing and testing', () => {
    expect(isDevRouteEnabled('development')).toBe(true);
    expect(isDevRouteEnabled('test')).toBe(true);
  });

  it('is off in production', () => {
    expect(isDevRouteEnabled('production')).toBe(false);
  });

  it('fails closed when the environment is unknown or missing', () => {
    expect(isDevRouteEnabled(undefined)).toBe(false);
    expect(isDevRouteEnabled('')).toBe(false);
    expect(isDevRouteEnabled('staging')).toBe(false);
    expect(isDevRouteEnabled('Production ')).toBe(false);
  });
});
