import type { PreviewProduct } from "@/lib/demo/catalog";
import { ProductCard } from "@/components/storefront/product-card";

export function ProductGrid({ products }: { products: readonly PreviewProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <span aria-hidden="true" className="empty-state__ornament">✳</span>
        <h3>No pieces in this preview edit</h3>
        <p>Try another category or explore the full presentation collection.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
