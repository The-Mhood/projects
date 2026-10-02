import Link from "next/link";
import { findPreviewProducts, PREVIEW_CATEGORIES, PREVIEW_NOTICE } from "@/lib/demo/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";

export const metadata = { title: "The Concept Edit · Marcadele" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const query = await searchParams;
  const validCategory = PREVIEW_CATEGORIES.some((category) => category.slug === query.category) ? query.category : undefined;
  const products = findPreviewProducts({ category: validCategory, sort: query.sort });

  return (
    <main className="collection-page page-container">
      <div className="collection-intro">
        <p className="eyebrow">MARCADELE · PRESENTATION CONCEPT</p>
        <h1 className="display-title">The concept edit</h1>
        <p className="lead-copy">A visual exploration of the Marcadele point of view — products and prices are illustrative only.</p>
        <p className="collection-intro__note">{PREVIEW_NOTICE}</p>
      </div>
      <div className="collection-controls">
        <p><strong>{products.length.toString().padStart(2, "0")}</strong> illustrative pieces</p>
        <form action="/shop" className="collection-filter-form">
          <label htmlFor="shop-category">Category
            <select defaultValue={validCategory ?? "all"} id="shop-category" name="category">
              <option value="all">All categories</option>
              {PREVIEW_CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.title}</option>)}
            </select>
          </label>
          <label htmlFor="shop-sort">Sort by
            <select defaultValue={query.sort ?? "featured"} id="shop-sort" name="sort">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high · sample</option>
              <option value="price-desc">Price: high to low · sample</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button className="button button--outline button--small" type="submit">Apply</button>
        </form>
      </div>
      <ProductGrid products={products} />
      <section className="collection-bottom-note"><span className="collection-bottom-note__line" /><p>Every piece on this page is illustrative concept content, not merchandise.</p><Link className="text-link" href="/about">About this presentation <span aria-hidden="true">↗</span></Link></section>
      <SectionHeading eyebrow="Continue your discovery" title="Explore by point of view" />
      <div className="text-category-links">{PREVIEW_CATEGORIES.map((category) => <Link key={category.slug} href={`/${category.slug}`}>{category.title} <span aria-hidden="true">↗</span></Link>)}</div>
    </main>
  );
}
