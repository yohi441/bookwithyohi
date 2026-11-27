import { getPrisma } from "./prisma";

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "event";
}

export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const prisma = getPrisma();

  let candidate = base;
  let suffix = 2;

  while (
    await prisma.eventType.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
