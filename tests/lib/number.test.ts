import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/cn';
import { formatCount } from '@/lib/number';

describe('formatCount', () => {
  it('groups thousands with Western digits', () => {
    expect(formatCount(1204)).toBe('1,204');
    expect(formatCount(0)).toBe('0');
    expect(formatCount(1234567)).toBe('1,234,567');
  });

  it('returns 0 for values that are not finite numbers', () => {
    expect(formatCount(Number.NaN)).toBe('0');
    expect(formatCount(Number.POSITIVE_INFINITY)).toBe('0');
  });

  it('shows whole numbers only', () => {
    expect(formatCount(3.7)).toBe('4');
  });
});

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });

  it('lets a later utility override an earlier one that conflicts', () => {
    expect(cn('px-2 text-muted', 'px-4')).toBe('text-muted px-4');
  });

  it('knows the design-token radii and shadows, so overrides actually replace them', () => {
    expect(cn('rounded-input', 'rounded-full')).toBe('rounded-full');
    expect(cn('rounded-card', 'rounded-check')).toBe('rounded-check');
    expect(cn('shadow-cta-glow', 'shadow-card-hover')).toBe('shadow-card-hover');
    expect(cn('rounded-input', 'text-sm')).toBe('rounded-input text-sm');
  });
});
