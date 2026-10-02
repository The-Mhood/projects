/** @typedef {{ variantId: string, quantity: number }} CartLineInput */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CART_LINES = 30;
const MAX_QUANTITY_PER_VARIANT = 10;

/**
 * Validate untrusted cart input and merge duplicate variant lines.
 * Prices and product data are intentionally not accepted from the browser.
 * @param {unknown} value
 * @returns {CartLineInput[]}
 */
export function parseCartLines(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CART_LINES) {
    throw new Error("Your bag is empty or contains too many items.");
  }

  const merged = new Map();
  for (const candidate of value) {
    if (typeof candidate !== "object" || candidate === null) {
      throw new Error("A bag item is invalid.");
    }

    const line = /** @type {{ variantId?: unknown, quantity?: unknown }} */ (candidate);
    if (
      typeof line.variantId !== "string" ||
      !UUID_PATTERN.test(line.variantId) ||
      typeof line.quantity !== "number" ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > MAX_QUANTITY_PER_VARIANT
    ) {
      throw new Error("A bag item has an invalid variant or quantity.");
    }

    const quantity = (merged.get(line.variantId) ?? 0) + line.quantity;
    if (quantity > MAX_QUANTITY_PER_VARIANT) {
      throw new Error("The requested quantity exceeds the limit for one item.");
    }
    merged.set(line.variantId, quantity);
  }

  return Array.from(merged, ([variantId, quantity]) => ({ variantId, quantity }));
}
