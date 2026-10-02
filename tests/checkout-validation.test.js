import test from "node:test";
import assert from "node:assert/strict";
import { parseCartLines } from "../lib/checkout/validation.js";

const variantA = "11111111-1111-4111-8111-111111111111";
const variantB = "22222222-2222-4222-8222-222222222222";

test("accepts valid lines and merges duplicate variants", () => {
  assert.deepEqual(
    parseCartLines([
      { variantId: variantA, quantity: 1 },
      { variantId: variantB, quantity: 2 },
      { variantId: variantA, quantity: 2 },
    ]),
    [
      { variantId: variantA, quantity: 3 },
      { variantId: variantB, quantity: 2 },
    ],
  );
});

test("rejects client-supplied invalid identifiers and quantities", () => {
  assert.throws(() => parseCartLines([{ variantId: "not-a-uuid", quantity: 1 }]));
  assert.throws(() => parseCartLines([{ variantId: variantA, quantity: 0 }]));
  assert.throws(() => parseCartLines([{ variantId: variantA, quantity: 1.5 }]));
});

test("rejects an empty bag and excessive merged quantities", () => {
  assert.throws(() => parseCartLines([]));
  assert.throws(() =>
    parseCartLines([
      { variantId: variantA, quantity: 6 },
      { variantId: variantA, quantity: 5 },
    ]),
  );
});
