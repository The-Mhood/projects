import Link from "next/link";
import { findPreviewProducts, PREVIEW_NOTICE } from "@/lib/demo/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata = { title: "New in · Marcadele Concept Edit" };

export default function NewInPage() {
  const products = findPreviewProducts({ newOnly: true });
  return (
    <main className="collection-page page-container">
      <div className="collection-intro collection-intro--editorial">
        <p className="eyebrow">A fresh perspective · Concept</p>
        <h1 className="display-title">New in the edit</h1>
        <p className="lead-copy">An illustrative first look at the shapes, details, and stories imagined for Marcadele.</p>
        <p className="collection-intro__note">{PREVIEW_NOTICE}</p>
      </div>
      <div className="collection-controls"><p><strong>{products.length.toString().padStart(2, "0")}</strong> illustrative pieces</p><Link className="text-link" href="/shop">View the full edit <span aria-hidden="true">↗</span></Link></div>
      <ProductGrid products={products} />
    </main>
  );
}
