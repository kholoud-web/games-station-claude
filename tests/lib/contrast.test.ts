import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/contrast';

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    expect(contrastRatio('#47D6FF', '#050D19')).toBeCloseTo(contrastRatio('#050D19', '#47D6FF'), 5);
  });

  it('accepts 3-digit hex and lowercase', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
  });

  it('rejects malformed colours', () => {
    expect(() => contrastRatio('red', '#000000')).toThrow(/invalid/i);
  });

  it('primary text passes AA on the card surface', () => {
    expect(contrastRatio('#F5F8FF', '#0D1D32')).toBeGreaterThanOrEqual(4.5);
  });
});
