import { describe, expect, it } from 'vitest';
import { escapeText, stripTags } from '@/lib/sanitize';

describe('stripTags', () => {
  it('removes tags and their event handlers', () => {
    expect(stripTags('<img src=x onerror=alert(1)>hi')).toBe('hi');
    expect(stripTags('<b>bold</b> and <a href="javascript:alert(1)">link</a>')).toBe('bold and link');
  });

  it('drops script and style elements together with their content', () => {
    expect(stripTags('<script>alert(1)</script>Hi')).toBe('Hi');
    expect(stripTags('a<style>body{display:none}</style>b')).toBe('ab');
  });

  it('cannot be tricked by tags that rebuild themselves after one pass', () => {
    // Removing the inner <b> leaves a fresh <img ...> behind, so a single pass is not enough.
    expect(stripTags('<<b>img src=x onerror=alert(1)>hi')).toBe('hi');
    expect(stripTags('<<script>script>alert(1)<</script>/script>')).toBe('');
    for (const input of ['<<b>img src=x>', '<<b>b>y', '<<i><b>script>x']) {
      expect(stripTags(input), input).not.toMatch(/<[a-z/!?]/i);
    }
  });

  it('removes a tag that was never closed', () => {
    expect(stripTags('hello <img src=x onerror=alert(1)')).toBe('hello ');
  });

  it('keeps ordinary text that happens to contain angle brackets', () => {
    expect(stripTags('5 < 6 and 9 > 7')).toBe('5 < 6 and 9 > 7');
  });

  it('leaves Arabic and other Unicode text alone', () => {
    expect(stripTags('أحمد <b>علي</b>')).toBe('أحمد علي');
  });

  it('is idempotent', () => {
    for (const input of ['<b>x</b>', '<<b>b>y', '5 < 6', 'plain']) {
      expect(stripTags(stripTags(input))).toBe(stripTags(input));
    }
  });
});

describe('escapeText', () => {
  it('escapes the characters that can break out of HTML text or attributes', () => {
    expect(escapeText(`<a href="x">&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  });

  it('does not double-escape on a single pass and leaves plain and Arabic text unchanged', () => {
    expect(escapeText('')).toBe('');
    expect(escapeText('مرحبا 123')).toBe('مرحبا 123');
  });
});
