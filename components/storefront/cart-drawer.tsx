"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useStorefrontCart } from "@/context/storefront-cart-context";
import { formatPreviewUsd, getPreviewProductByVariantId } from "@/lib/demo/catalog";

export function CartDrawer() {
  const { items, status, error, drawerOpen, closeCart, setQuantity, removeLine } = useStorefrontCart();
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const previewLines = useMemo(() => items.map((line) => ({
    line,
    product: getPreviewProductByVariantId(line.variantId),
  })).filter((entry) => entry.product !== null), [items]);
  const subtotal = previewLines.reduce((sum, entry) => sum + (entry.product?.priceCents ?? 0) * entry.line.quantity, 0);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeCart(); };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("drawer-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("drawer-open");
    };
  }, [drawerOpen, closeCart]);

  if (!drawerOpen) return null;

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCart(); }}>
      <aside aria-labelledby="cart-drawer-title" aria-modal="true" className="cart-drawer" role="dialog">
        <div className="cart-drawer__header">
          <div>
            <p className="eyebrow">A considered edit</p>
            <h2 id="cart-drawer-title">Your preview bag <span>({items.length})</span></h2>
          </div>
          <button aria-label="Close bag" className="icon-button" onClick={closeCart} type="button"><X aria-hidden="true" size={20} /></button>
        </div>

        <p className="cart-drawer__notice">Illustrative preview only · no items are for sale.</p>

        <div className="cart-drawer__body">
          {status === "loading" && items.length === 0 ? (
            <p className="muted-copy">Opening your preview bag…</p>
          ) : previewLines.length === 0 ? (
            <div className="cart-drawer__empty">
              <span aria-hidden="true" className="empty-state__ornament">✳</span>
              <p>Your bag is waiting for a point of view.</p>
              <Link className="text-link" href="/shop" onClick={closeCart}>Explore the edit <span aria-hidden="true">↗</span></Link>
            </div>
          ) : (
            <ul className="drawer-lines">
              {previewLines.map(({ line, product }) => product && (
                <li className="drawer-line" key={line.variantId}>
                  <Link className="drawer-line__image" href={`/product/${product.slug}`} onClick={closeCart}>
                    <Image alt={product.imageAlt} fill sizes="100px" src={product.image} />
                  </Link>
                  <div className="drawer-line__detail">
                    <p className="product-card__designer">{product.editLabel}</p>
                    <Link className="drawer-line__title" href={`/product/${product.slug}`} onClick={closeCart}>{product.name}</Link>
                    <p className="drawer-line__option">{product.variants.find((variant) => variant.id === line.variantId)?.label}</p>
                    <div className="drawer-line__bottom">
                      <div aria-label={`Quantity ${line.quantity}`} className="quantity-control">
                        <button aria-label={`Decrease quantity of ${product.name}`} onClick={() => line.quantity === 1 ? void removeLine(line.variantId) : void setQuantity(line.variantId, line.quantity - 1)} type="button"><Minus aria-hidden="true" size={13} /></button>
                        <span>{line.quantity}</span>
                        <button aria-label={`Increase quantity of ${product.name}`} disabled={line.quantity >= 10 || status === "loading"} onClick={() => void setQuantity(line.variantId, line.quantity + 1)} type="button"><Plus aria-hidden="true" size={13} /></button>
                      </div>
                      <span className="drawer-line__price">{formatPreviewUsd(product.priceCents * line.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {previewLines.length > 0 && (
          <div className="cart-drawer__footer">
            {error && <p className="inline-feedback" role="alert">{error}</p>}
            <div className="cart-drawer__subtotal"><span>Illustrative subtotal</span><strong>{formatPreviewUsd(subtotal)}</strong></div>
            <p className="micro-copy">Prices are sample figures for presentation and are not offers to sell.</p>
            <button className="button button--dark button--wide" onClick={() => setCheckoutNotice(true)} type="button">Continue to checkout</button>
            {checkoutNotice && <p className="preview-checkout-notice" role="status">Checkout is not enabled in this preview. No payment, order, or reservation will be created.</p>}
            <Link className="text-link cart-drawer__view-bag" href="/cart" onClick={closeCart}>View full bag <span aria-hidden="true">↗</span></Link>
          </div>
        )}
      </aside>
    </div>
  );
}
