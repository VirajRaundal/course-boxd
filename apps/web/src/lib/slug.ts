const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const MULTIPLE_DASHES = /-{2,}/g;
const EDGE_DASHES = /^-+|-+$/g;

function fallbackSlug(): string {
  return `entry-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function slugify(input: string): string {
  if (!input) {
    return "";
  }

  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(NON_ALPHANUMERIC, "-")
    .replace(MULTIPLE_DASHES, "-")
    .replace(EDGE_DASHES, "");
}

export function slugifyWithFallback(input: string): string {
  const slug = slugify(input);
  return slug || fallbackSlug();
}
