"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWishlist } from "@/context/wishlist-context";
import { PREVIEW_PRODUCTS } from "@/lib/demo/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";

export default function WishlistPage() {
  const { slugs, status, error } = useWishlist();
  const products = useMemo(() => PREVIEW_PRODUCTS.filter((product) => slugs.includes(product.slug)), [slugs]);

  return (
    <main className="wishlist-page page-container">
      <section className="wishlist-page__intro"><p className="eyebrow">A personal edit · Stored in this browser</p><h1 className="display-title">Saved pieces</h1><p className="lead-copy">Keep the concepts that caught your eye close at hand.</p><p className="collection-intro__note">Saved items are local to this browser. No account or server sync is connected.</p></section>
      {status === "loading" ? <p className="muted-copy">Loading your saved pieces…</p> : error ? <p className="inline-feedback" role="alert">{error}</p> : products.length === 0 ? <div className="wishlist-empty"><span aria-hidden="true">♡</span><h2>Your saved edit begins here.</h2><p>Tap the heart on any concept piece to keep it here.</p><Link className="button button--dark" href="/shop">Explore the edit <span aria-hidden="true">↗</span></Link></div> : <ProductGrid products={products} />}
    </main>
  );
}
