/**
 * Fills `{name}` placeholders — the only templating a message file needs. Its own file so a client
 * component can use it without importing `messages.ts`, which would put every string in the bundle.
 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
