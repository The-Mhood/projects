import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPreviewCollection, getPreviewProductBySlug } from "@/lib/demo/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";

export default async function LookbookStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getPreviewCollection(slug);
  if (!story) notFound();
  const products = story.productSlugs.map((productSlug) => getPreviewProductBySlug(productSlug)).filter((product) => product !== null);

  return (
    <main className="lookbook-story page-container">
      <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/lookbook">Lookbook</Link><span>/</span><span aria-current="page">{story.title}</span></nav>
      <section className="lookbook-story__hero">
        <div className="lookbook-story__image"><Image alt={story.imageAlt} className="editorial-image" fill priority sizes="100vw" src={story.image} /><span className="lookbook-story__image-note">ILLUSTRATIVE EDITORIAL IMAGE</span></div>
        <div className="lookbook-story__copy"><p className="eyebrow">{story.subtitle}</p><h1 className="display-title">{story.title}</h1><p className="lead-copy">{story.description}</p><p className="collection-intro__note">This lookbook story is a visual concept and does not represent available merchandise or a confirmed designer collaboration.</p><Link className="text-link" href="/lookbook">All lookbook stories <span aria-hidden="true">↗</span></Link></div>
      </section>
      <section className="lookbook-story__products"><SectionHeading eyebrow="A visual pairing" title="Explore the pieces" /><ProductGrid products={products} /></section>
    </main>
  );
}
