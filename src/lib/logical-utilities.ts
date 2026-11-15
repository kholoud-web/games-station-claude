/**
 * RTL guard: Tailwind classes that name a physical side (left/right) break in Arabic.
 * Components must use logical utilities (ms-, me-, ps-, pe-, start-, end-, text-start, text-end,
 * border-s, rounded-s, ...) so one class works in both directions.
 */

const BODY = String.raw`[\w./%\[\]-]+`;

const PHYSICAL_FAMILIES = [
  String.raw`[mp][lr]-${BODY}`, // margin and padding
  String.raw`(?:left|right)-${BODY}`, // positioning
  String.raw`text-(?:left|right)(?![\w-])`, // alignment
  String.raw`border-[lr](?![a-z0-9])(?:-${BODY})?`, // borders
  String.raw`rounded-(?:[lr]|tl|tr|bl|br)(?![a-z0-9])(?:-${BODY})?`, // corners
];

// Optional variants (md:, hover:), optional negative sign, then one family. The lookbehind stops
// matches that start inside a longer word, such as the end of an unrelated class name.
const PHYSICAL_UTILITY = new RegExp(
  String.raw`(?<![\w:-])(?:[a-z0-9-]+:)*-?(?:${PHYSICAL_FAMILIES.join('|')})`,
  'g',
);

/** Returns every physical-direction utility class found in the source, in order. */
export function findPhysicalUtilities(source: string): string[] {
  return source.match(PHYSICAL_UTILITY) ?? [];
}
