"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStorefrontCart } from "@/context/storefront-cart-context";
import { formatPreviewUsd, getPreviewProductByVariantId } from "@/lib/demo/catalog";

export function PreviewCartPage() {
  const { items, status, error, setQuantity, removeLine, clearCart } = useStorefrontCart();
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const previewLines = useMemo(() => items.map((line) => ({
    line,
    product: getPreviewProductByVariantId(line.variantId),
  })).filter((entry) => entry.product !== null), [items]);
  const subtotal = previewLines.reduce((sum, entry) => sum + (entry.product?.priceCents ?? 0) * entry.line.quantity, 0);

  if (status === "loading" && items.length === 0) {
    return <section className="cart-page"><p className="eyebrow">The Marcadele edit</p><h1 className="display-title">Your preview bag</h1><p className="muted-copy">Loading your saved concept pieces…</p></section>;
  }

  if (previewLines.length === 0) {
    return (
      <section className="cart-page cart-page--empty">
        <p className="eyebrow">The Marcadele edit</p>
        <span aria-hidden="true" className="empty-state__ornament">✳</span>
        <h1 className="display-title">Your preview bag is empty</h1>
        <p className="lead-copy">Begin with the pieces that speak to you. This concept bag is illustrative and cannot be checked out.</p>
        <Link className="button button--dark" href="/shop">Explore the edit <span aria-hidden="true">↗</span></Link>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-page__heading">
        <div>
          <p className="eyebrow">The Marcadele edit · Presentation preview</p>
          <h1 className="display-title">Your preview bag</h1>
        </div>
        <Link className="text-link" href="/shop">Continue exploring <span aria-hidden="true">↗</span></Link>
      </div>
      <p className="presentation-notice">Illustrative products and prices only. Nothing in this bag is for sale and checkout is not connected.</p>

      <div className="preview-cart-layout">
        <ul className="preview-cart-lines">
          {previewLines.map(({ line, product }) => product && (
            <li className="preview-cart-line" key={line.variantId}>
              <Link className="preview-cart-line__image" href={`/product/${product.slug}`}>
                <Image alt={product.imageAlt} fill sizes="(max-width: 640px) 30vw, 180px" src={product.image} />
              </Link>
              <div className="preview-cart-line__detail">
                <p className="product-card__designer">{product.editLabel}</p>
                <Link className="preview-cart-line__title" href={`/product/${product.slug}`}>{product.name}</Link>
                <p className="muted-copy">{product.variants.find((variant) => variant.id === line.variantId)?.label}</p>
                <p className="preview-cart-line__unit">{formatPreviewUsd(product.priceCents)} <span>illustrative price</span></p>
              </div>
              <div className="preview-cart-line__actions">
                <div aria-label={`Quantity ${line.quantity}`} className="quantity-control quantity-control--large">
                  <button aria-label={`Decrease quantity of ${product.name}`} onClick={() => line.quantity === 1 ? void removeLine(line.variantId) : void setQuantity(line.variantId, line.quantity - 1)} type="button"><Minus aria-hidden="true" size={14} /></button>
                  <span>{line.quantity}</span>
                  <button aria-label={`Increase quantity of ${product.name}`} disabled={line.quantity >= 10 || status === "loading"} onClick={() => void setQuantity(line.variantId, line.quantity + 1)} type="button"><Plus aria-hidden="true" size={14} /></button>
                </div>
                <strong>{formatPreviewUsd(product.priceCents * line.quantity)}</strong>
                <button className="text-button" onClick={() => void removeLine(line.variantId)} type="button"><Trash2 aria-hidden="true" size={15} /> Remove</button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="preview-summary">
          <p className="eyebrow">A visual estimate only</p>
          <h2>Bag summary</h2>
          <div className="preview-summary__row"><span>Illustrative subtotal</span><strong>{formatPreviewUsd(subtotal)}</strong></div>
          <p className="micro-copy">Shipping, tax, availability, and final pricing have not been configured. This figure is not a quote.</p>
          {error && <p className="inline-feedback" role="alert">{error}</p>}
          <button className="button button--dark button--wide" onClick={() => setCheckoutNotice(true)} type="button">Continue to checkout</button>
          {checkoutNotice && <p className="preview-checkout-notice" role="status">Checkout is disabled for this concept preview. No payment or order will be created.</p>}
          <button className="text-button preview-summary__clear" onClick={() => void clearCart()} type="button">Clear preview bag</button>
        </aside>
      </div>
    </section>
  );
}
