"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";

type VariantOption = {
  id: string;
  label: string;
  available: boolean;
};

export function AddToBagButton({ variants }: { variants: VariantOption[] }) {
  const availableVariants = variants.filter((variant) => variant.available);
  const [selectedVariantId, setSelectedVariantId] = useState(availableVariants[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const { addLine, status, error } = useCart();
  const isBusy = status === "loading";

  async function handleAdd() {
    setAdded(false);
    await addLine(selectedVariantId, 1);
    if (status !== "error") setAdded(true);
  }

  if (availableVariants.length === 0) {
    return (
      <button className="min-h-12 w-full cursor-not-allowed bg-[#b8ada0] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white" disabled>
        Sold out
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="poc-variant">
        Choose an option
      </label>
      <select
        className="min-h-12 w-full border border-[#b8ada0] bg-white px-3"
        id="poc-variant"
        value={selectedVariantId}
        onChange={(event) => {
          setSelectedVariantId(event.target.value);
          setAdded(false);
        }}
      >
        {variants.map((variant) => (
          <option key={variant.id} value={variant.id} disabled={!variant.available}>
            {variant.label}{variant.available ? "" : " — Sold out"}
          </option>
        ))}
      </select>
      <button
        className="min-h-12 w-full bg-[#111111] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#2a211c] disabled:cursor-wait disabled:opacity-60"
        type="button"
        disabled={!selectedVariantId || isBusy}
        onClick={handleAdd}
      >
        {isBusy ? "Updating bag…" : "Add to bag"}
      </button>
      <p aria-live="polite" className="min-h-5 text-sm text-[#5f5851]">
        {added && status === "success" ? "Added to your bag." : error ?? ""}
      </p>
    </div>
  );
}
