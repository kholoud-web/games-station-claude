const RAW_TEXT_ELEMENT = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const COMPLETE_TAG = /<\/?[a-zA-Z!?][^>]*>/g;
const UNCLOSED_TAG = /<\/?[a-zA-Z!?][^>]*$/;

/**
 * Turns user input into plain text: removes tags, script and style content, and tags left
 * unclosed. It repeats until nothing changes, so a tag that rebuilds itself after one pass
 * (`<<b>b>`) is still caught. Text such as `5 < 6` is kept, because `<` followed by a space
 * does not start a tag. React escapes text when rendering, so this is a second layer, not the only one.
 */
export function stripTags(input: string): string {
  let current = input;
  for (;;) {
    const next = current.replace(RAW_TEXT_ELEMENT, '').replace(COMPLETE_TAG, '').replace(UNCLOSED_TAG, '');
    if (next === current) return next;
    current = next;
  }
}

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for the rare case it must be placed inside an HTML string. */
export function escapeText(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}
