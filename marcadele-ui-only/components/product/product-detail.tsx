import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { PreviewProduct } from "@/lib/demo/catalog";
import { formatPreviewUsd, PREVIEW_PRODUCTS } from "@/lib/demo/catalog";
import { PreviewAddToBagButton } from "@/components/storefront/preview-add-to-bag-button";
import { ProductGrid } from "@/components/storefront/product-grid";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { SectionHeading } from "@/components/storefront/section-heading";

export function ProductDetail({ product }: { product: PreviewProduct }) {
  const recommendations = PREVIEW_PRODUCTS.filter((item) => item.id !== product.id).slice(0, 2);

  return (
    <main className="product-page page-container">
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href={`/${product.category}`}>{product.categoryLabel}</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-gallery__hero">
            <Image alt={product.imageAlt} className="product-gallery__image" fill priority sizes="(max-width: 900px) 100vw, 58vw" src={product.image} />
            <span className="image-caption-pill">Illustrative campaign image</span>
            <span className="product-gallery__index">01 <i>/</i> 01</span>
          </div>
          <p className="product-gallery__caption">An editorial image created for the presentation concept. It does not confirm a product or inventory.</p>
        </div>

        <section aria-labelledby="product-title" className="product-detail-copy">
          <div className="product-detail-copy__topline"><p className="eyebrow">{product.editLabel}</p><WishlistButton slug={product.slug} /></div>
          <p className="product-detail-copy__category">{product.categoryLabel} <span>·</span> Marcadele concept collection</p>
          <h1 className="product-detail-copy__title" id="product-title">{product.name}</h1>
          <p className="product-detail-copy__description">{product.description}</p>
          <div className="product-detail-copy__price">
            <strong>{formatPreviewUsd(product.priceCents)}</strong>
            <span>Illustrative price · USD</span>
          </div>
          {product.compareAtPriceCents && <p className="product-detail-copy__offer">Illustrative price styling only — no offer is available.</p>}

          <div className="product-detail-copy__rule" />
          <p className="product-detail-copy__color"><span>Color direction</span><strong>{product.color}</strong></p>
          <PreviewAddToBagButton variants={product.variants} />
          <div className="product-detail-copy__disclaimer">This is a visual catalog concept. The displayed product, options, price, materials, and availability are illustrative; nothing is for sale.</div>

          <div className="product-accordions">
            <details>
              <summary>Product notes <ChevronDown aria-hidden="true" size={16} /></summary>
              <p>{product.description}</p>
            </details>
            <details>
              <summary>Materials & care <ChevronDown aria-hidden="true" size={16} /></summary>
              <p>{product.materials} {product.care}</p>
            </details>
            <details>
              <summary>Shipping & returns <ChevronDown aria-hidden="true" size={16} /></summary>
              <p>Shipping, tax, delivery, and return terms are not configured in this concept preview.</p>
            </details>
          </div>
          <Link className="text-link product-detail-copy__back" href="/shop">Continue exploring <span aria-hidden="true">↗</span></Link>
        </section>
      </div>

      <section className="product-recommendations">
        <SectionHeading eyebrow="Continue the story" title="Pieces in the same spirit" href="/shop" linkLabel="Explore the edit" />
        <ProductGrid products={recommendations} />
      </section>
    </main>
  );
}
