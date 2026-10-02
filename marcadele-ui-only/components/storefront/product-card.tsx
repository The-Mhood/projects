import Image from "next/image";
import Link from "next/link";
import type { PreviewProduct } from "@/lib/demo/catalog";
import { formatPreviewUsd } from "@/lib/demo/catalog";
import { WishlistButton } from "@/components/storefront/wishlist-button";

export function ProductCard({ product }: { product: PreviewProduct }) {
  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <Link aria-label={`View ${product.name}`} className="product-card__image-link" href={`/product/${product.slug}`}>
          <Image
            alt={product.imageAlt}
            className="product-card__image"
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 25vw"
            src={product.image}
          />
        </Link>
        <span className="product-card__badge">Concept</span>
        <WishlistButton className="product-card__heart" slug={product.slug} />
        <Link className="product-card__quick-link" href={`/product/${product.slug}`}>
          Discover the piece <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="product-card__details">
        <p className="product-card__designer">{product.editLabel}</p>
        <div className="product-card__title-row">
          <Link className="product-card__title" href={`/product/${product.slug}`}>{product.name}</Link>
          {product.isSale && <span className="product-card__sale-label">Concept pricing</span>}
        </div>
        <p className="product-card__price">
          {formatPreviewUsd(product.priceCents)}
          {product.compareAtPriceCents && <span className="product-card__compare">{formatPreviewUsd(product.compareAtPriceCents)}</span>}
        </p>
      </div>
    </article>
  );
}
