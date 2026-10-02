const STORAGE_KEY = "marcadele.preview.wishlist.v1";
const MAX_SAVED_SLUGS = 100;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSlugs(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > MAX_SAVED_SLUGS) {
    throw new Error("The saved list is invalid. Clear it to continue.");
  }

  const unique = new Set<string>();
  for (const slug of value) {
    if (typeof slug !== "string" || slug.length > 100 || !SLUG_PATTERN.test(slug)) {
      throw new Error("The saved list is invalid. Clear it to continue.");
    }
    unique.add(slug);
  }
  return Array.from(unique);
}

export const wishlistRepository = {
  async load(): Promise<string[]> {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("The saved list could not be read. Clear it to continue.");
    }
    return validateSlugs(parsed);
  },

  async save(slugs: string[]): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validateSlugs(slugs)));
  },

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
