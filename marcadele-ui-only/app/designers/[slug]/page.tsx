import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPreviewStyleDirection, getPreviewProductBySlug } from "@/lib/demo/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";

export default async function StyleDirectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const direction = getPreviewStyleDirection(slug);
  if (!direction) notFound();
  const products = direction.productSlugs.map((productSlug) => getPreviewProductBySlug(productSlug)).filter((product) => product !== null);

  return (
    <main className="editorial-page page-container">
      <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/designers">Style directions</Link><span>/</span><span aria-current="page">{direction.title}</span></nav>
      <section className="direction-hero">
        <div className="direction-hero__image"><Image alt={direction.imageAlt} className="editorial-image" fill priority sizes="(max-width: 800px) 100vw, 58vw" src={direction.image} /></div>
        <div className="direction-hero__copy"><p className="eyebrow">{direction.descriptor}</p><h1 className="display-title">{direction.title}</h1><p className="lead-copy">{direction.description}</p><p className="collection-intro__note">Illustrative creative direction only. This is not a designer profile or a claim of collaboration.</p><Link className="text-link" href="/designers">Back to all directions <span aria-hidden="true">↗</span></Link></div>
      </section>
      <section className="direction-products"><SectionHeading eyebrow="A visual pairing" title="Pieces in this direction" /><ProductGrid products={products} /></section>
    </main>
  );
}
