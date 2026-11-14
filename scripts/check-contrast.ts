/**
 * Verifies WCAG contrast for design-token pairs. Reads hex values from src/styles/tokens.css.
 * Exit code 1 if any `required` pair fails. `advisory` pairs are reported but do not fail.
 */
import { readFileSync } from 'node:fs';
import { contrastRatio } from '../src/lib/contrast';

type Level = 'required' | 'advisory';
type Pair = { fg: string; bg: string; min: number; level: Level; note: string };

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = new Map<string, string>();
for (const match of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) {
  tokens.set(match[1] as string, match[2] as string);
}

const surfaces = ['canvas', 'surface-2', 'card', 'elevated'] as const;
const pairs: Pair[] = [];

for (const bg of surfaces) {
  pairs.push({ fg: 'text', bg, min: 4.5, level: 'required', note: 'body text' });
  pairs.push({ fg: 'muted', bg, min: 4.5, level: 'required', note: 'secondary text' });
  pairs.push({ fg: 'cyan', bg, min: 4.5, level: 'required', note: 'accent text' });
  pairs.push({ fg: 'warning', bg, min: 4.5, level: 'required', note: 'low-stock text' });
  pairs.push({ fg: 'error', bg, min: 4.5, level: 'required', note: 'error text' });
  pairs.push({ fg: 'cobalt', bg, min: 3, level: 'required', note: 'large text / UI only' });
  pairs.push({ fg: 'border', bg, min: 3, level: 'advisory', note: 'UI boundary (WCAG 1.4.11)' });
}
pairs.push({ fg: 'on-cyan', bg: 'cyan', min: 4.5, level: 'required', note: 'primary button label' });
pairs.push({ fg: 'on-cyan', bg: 'cyan-hover', min: 4.5, level: 'required', note: 'button hover label' });
pairs.push({ fg: 'on-error-container', bg: 'error-container', min: 4.5, level: 'required', note: 'error banner' });

let failures = 0;
let advisories = 0;
console.log('fg'.padEnd(20), 'bg'.padEnd(16), 'ratio'.padStart(6), 'min'.padStart(5), 'result  note');
for (const p of pairs) {
  const fg = tokens.get(p.fg);
  const bg = tokens.get(p.bg);
  if (!fg || !bg) throw new Error(`Missing token for pair ${p.fg} / ${p.bg}`);
  const ratio = contrastRatio(fg, bg);
  const ok = ratio >= p.min;
  if (!ok && p.level === 'required') failures += 1;
  if (!ok && p.level === 'advisory') advisories += 1;
  const result = ok ? 'pass' : p.level === 'required' ? 'FAIL' : 'advisory';
  console.log(
    p.fg.padEnd(20),
    p.bg.padEnd(16),
    ratio.toFixed(2).padStart(6),
    String(p.min).padStart(5),
    result.padEnd(8),
    p.note,
  );
}
console.log(`\n${pairs.length} pairs checked, ${failures} required failures, ${advisories} advisory shortfalls`);
process.exit(failures > 0 ? 1 : 0);
