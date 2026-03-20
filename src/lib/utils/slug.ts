import { createId } from "@paralleldrive/cuid2";

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const suffix = createId().slice(0, 8);
  return `${base}-${suffix}`;
}
