import { describe, expect, it } from 'vitest';

describe('test tooling', () => {
  it('runs in jsdom with jest-dom matchers and the @/ alias', async () => {
    document.body.innerHTML = '<p>hello</p>';
    expect(document.body).toHaveTextContent('hello');
    const alias = await import('@/lib/contrast');
    expect(typeof alias.contrastRatio).toBe('function');
  });
});
