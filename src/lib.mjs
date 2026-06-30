// Shared helpers for the build + screenshot scripts.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Stable filename-safe id for a link, used for its screenshot file.
export function slug(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Flatten categories into a single list, tagging each item with its category.
export function flatten(data) {
  return data.categories.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, category: cat.name, categoryEmoji: cat.emoji }))
  );
}
