import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Class-name helper. tailwind-merge only knows Tailwind's built-in radius and
 * shadow names, so the design-token ones (see src/app/globals.css) are
 * registered here; otherwise `rounded-input` + `rounded-full` would both survive.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['card', 'tile', 'input', 'check'],
      shadow: ['cta-glow', 'cta-glow-hover', 'card-hover', 'focus-glow'],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
