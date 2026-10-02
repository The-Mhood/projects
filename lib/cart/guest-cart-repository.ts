export type GuestCartLine = {
  variantId: string;
  quantity: number;
};

const STORAGE_KEY = "marcadele.poc.guest-cart.v1";
const MAX_CART_LINES = 30;
const MAX_QUANTITY_PER_VARIANT = 10;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateLines(value: unknown): GuestCartLine[] {
  if (!Array.isArray(value) || value.length > MAX_CART_LINES) {
    throw new Error("The saved bag is invalid. Clear it to continue.");
  }

  const merged = new Map<string, number>();
  for (const candidate of value) {
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      !("variantId" in candidate) ||
      !("quantity" in candidate)
    ) {
      throw new Error("The saved bag is invalid. Clear it to continue.");
    }

    const line = candidate as { variantId: unknown; quantity: unknown };
    if (
      typeof line.variantId !== "string" ||
      !UUID_PATTERN.test(line.variantId) ||
      typeof line.quantity !== "number" ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > MAX_QUANTITY_PER_VARIANT
    ) {
      throw new Error("The saved bag is invalid. Clear it to continue.");
    }

    const nextQuantity = (merged.get(line.variantId) ?? 0) + line.quantity;
    if (nextQuantity > MAX_QUANTITY_PER_VARIANT) {
      throw new Error("The saved bag contains too many of one item.");
    }
    merged.set(line.variantId, nextQuantity);
  }

  return Array.from(merged, ([variantId, quantity]) => ({ variantId, quantity }));
}

export const guestCartRepository = {
  async load(): Promise<GuestCartLine[]> {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("The saved bag could not be read. Clear it to continue.");
    }
    return validateLines(parsed);
  },

  async save(items: GuestCartLine[]): Promise<void> {
    if (typeof window === "undefined") return;
    const validated = validateLines(items);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
  },

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
