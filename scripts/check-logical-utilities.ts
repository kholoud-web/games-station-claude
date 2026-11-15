import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findPhysicalUtilities } from '../src/lib/logical-utilities';

const SRC = join(process.cwd(), 'src');
const files = (readdirSync(SRC, { recursive: true }) as string[]).filter((f) => /\.(ts|tsx)$/.test(f));

let violations = 0;
for (const file of files) {
  const lines = readFileSync(join(SRC, file), 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const token of findPhysicalUtilities(line)) {
      violations += 1;
      console.error(`src/${file}:${index + 1}  ${token}  (use a logical utility)`);
    }
  });
}

if (violations > 0) {
  console.error(`\n${violations} physical-direction utilities found.`);
  process.exit(1);
}
console.log(`RTL check passed: ${files.length} files scanned, no physical-direction utilities.`);
