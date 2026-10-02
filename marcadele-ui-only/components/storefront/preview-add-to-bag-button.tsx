"use client";

import { useState } from "react";
import { useStorefrontCart } from "@/context/storefront-cart-context";
import type { PreviewVariant } from "@/lib/demo/catalog";

export function PreviewAddToBagButton({ variants }: { variants: readonly PreviewVariant[] }) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const { addLine, openCart, status, error } = useStorefrontCart();

  async function handleAdd() {
    setAdded(false);
    const saved = await addLine(selectedVariantId, 1);
    if (saved) {
      setAdded(true);
      openCart();
    }
  }

  return (
    <div className="preview-add-to-bag">
      {variants.length > 1 && (
        <label className="field-label" htmlFor="preview-option">
          Sample option
          <select
            className="field-control"
            id="preview-option"
            value={selectedVariantId}
            onChange={(event) => { setSelectedVariantId(event.target.value); setAdded(false); }}
          >
            {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
          </select>
        </label>
      )}
      {variants.length === 1 && <p className="sample-option-note">{variants[0]?.label}</p>}
      <button className="button button--dark button--wide" disabled={!selectedVariantId || status === "loading"} onClick={() => void handleAdd()} type="button">
        {status === "loading" ? "Adding to preview bag…" : "Add to preview bag"}
      </button>
      <p aria-live="polite" className="inline-feedback">{added ? "Added to your preview bag." : error ?? ""}</p>
      <p className="micro-copy">Illustrative only. This action does not reserve or purchase a product.</p>
    </div>
  );
}
