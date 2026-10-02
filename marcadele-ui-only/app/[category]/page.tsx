import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findPreviewProducts, getPreviewCategory, PREVIEW_NOTICE } from "@/lib/demo/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const [{ category: slug }, query] = await Promise.all([params, searchParams]);
  const category = getPreviewCategory(slug);
  const isSaleConcept = slug === "sale";
  if (!category && !isSaleConcept) notFound();

  const title = isSaleConcept ? "Promotional styling" : category!.title;
  const eyebrow = isSaleConcept ? "Pricing direction · Concept" : category!.eyebrow;
  const description = isSaleConcept
    ? "An exploration of promotional presentation. This is not a live sale or an offer to purchase."
    : category!.description;
  const products = findPreviewProducts({ category: isSaleConcept ? undefined : slug, saleOnly: isSaleConcept, sort: query.sort });

  return (
    <main className="collection-page page-container">
      <section className="category-hero">
        {category && <div className="category-hero__image"><Image alt={category.imageAlt} className="editorial-image" fill priority sizes="(max-width: 800px) 100vw, 48vw" src={category.image} /></div>}
        <div className="category-hero__copy">
          <p className="eyebrow">{eyebrow} · Marcadele concept</p>
          <h1 className="display-title">{title}</h1>
          <p className="lead-copy">{description}</p>
          <p className="collection-intro__note">{PREVIEW_NOTICE}</p>
          <Link className="text-link" href="/shop">Explore the complete edit <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <div className="collection-controls"><p><strong>{products.length.toString().padStart(2, "0")}</strong> illustrative pieces</p><Link className="text-link" href="/new-in">Discover what’s new <span aria-hidden="true">↗</span></Link></div>
      <ProductGrid products={products} />
    </main>
  );
}
