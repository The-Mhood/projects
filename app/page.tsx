import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { PREVIEW_CATEGORIES, PREVIEW_PRODUCTS } from "@/lib/demo/catalog";
import { CategoryCard } from "@/components/storefront/category-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";

export default function HomePage() {
  const featured = PREVIEW_PRODUCTS.filter((product) => product.isFeatured);

  return (
    <main className="home-page">
      <section aria-label="Marcadele concept campaign" className="home-hero">
        <Image alt="Editorial fashion campaign image created for the Marcadele concept preview" className="home-hero__image" fill priority sizes="100vw" src="/images/marcadele-hero.jpg" />
        <div aria-hidden="true" className="home-hero__shade" />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow"><span /> MARCADELE · THE CONCEPT EDIT</p>
          <p className="home-hero__overline">A NEW PERSPECTIVE ON FASHION DISCOVERY</p>
          <h1>Curated luxury.<br /><em>A point of view.</em></h1>
          <p className="home-hero__intro">A considered world of style, form, and personal expression — imagined for the modern wardrobe.</p>
          <div className="home-hero__actions">
            <Link className="button button--light" href="/shop">Explore the concept edit <ArrowUpRight aria-hidden="true" size={16} /></Link>
            <Link className="home-hero__secondary-link" href="/lookbook">Discover the story <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="home-hero__caption"><span>01 / 04</span><span>EDITORIAL CAMPAIGN · CONCEPT IMAGE</span></div>
        <Link aria-label="Scroll to discover" className="home-hero__scroll" href="#discover"><span>SCROLL TO DISCOVER</span><ArrowDown aria-hidden="true" size={14} /></Link>
        <div aria-hidden="true" className="home-hero__vertical">OREGON · PRESENTATION CONCEPT</div>
      </section>

      <section className="home-intro page-container" id="discover">
        <div className="home-intro__mark" aria-hidden="true">M.</div>
        <div className="home-intro__copy">
          <p className="eyebrow">A considered perspective</p>
          <h2>Fashion is more than what you wear.<br /><em>It is how you see the world.</em></h2>
          <p>Marcadele is being shaped as a thoughtful destination for fashion discovery — bringing a distinctive point of view to the way we find, explore, and make a piece our own.</p>
          <Link className="text-link" href="/about">Discover the Marcadele concept <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="home-intro__side-note"><span>01</span><span>AN IDEA IN PROGRESS<br />OREGON, USA</span></div>
      </section>

      <section className="home-categories page-container">
        <SectionHeading eyebrow="The concept collection" title="Find your own expression" description="Explore the visual direction across four imagined categories." href="/shop" linkLabel="View all pieces" />
        <div className="category-grid">
          {PREVIEW_CATEGORIES.map((category, index) => (
            <CategoryCard description={category.description} eyebrow={category.eyebrow} href={`/${category.slug}`} image={category.image} imageAlt={category.imageAlt} key={category.slug} number={`0${index + 1}`} title={category.title} />
          ))}
        </div>
      </section>

      <section className="home-featured page-container">
        <SectionHeading eyebrow="A first look" title="Pieces with presence" description="A small illustrative edit created for this investor presentation." href="/new-in" linkLabel="Discover the edit" />
        <ProductGrid products={featured} />
        <p className="collection-disclaimer">All products, imagery, options, and prices shown are illustrative concept content. Nothing is available for purchase.</p>
      </section>

      <section className="home-story">
        <div className="home-story__image-wrap">
          <Image alt="Sculpted bag concept created for the Marcadele presentation" className="home-story__image" fill sizes="(max-width: 760px) 100vw, 50vw" src="/images/product-sculpted-bag.jpg" />
          <span className="home-story__image-label">OBJECTS OF FORM · CONCEPT IMAGE</span>
        </div>
        <div className="home-story__copy">
          <p className="eyebrow">Designed for discovery</p>
          <span className="home-story__rule" />
          <h2>Considered details.<br /><em>Lasting impressions.</em></h2>
          <p>A visual language built on quiet confidence, expressive form, and an appreciation for the details that make a look feel personal.</p>
          <Link className="button button--outline-light" href="/designers">Explore the style directions <ArrowUpRight aria-hidden="true" size={16} /></Link>
          <span className="home-story__ornament" aria-hidden="true">M</span>
        </div>
      </section>

      <section className="home-lookbook page-container">
        <div className="home-lookbook__copy">
          <p className="eyebrow">The Marcadele lookbook · Concept</p>
          <h2>Stories told<br /><em>in silhouette.</em></h2>
          <p>Editorial worlds created to explore where fashion, feeling, and form meet.</p>
          <Link className="text-link" href="/lookbook">Enter the lookbook <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="home-lookbook__images">
          <Link className="home-lookbook__image home-lookbook__image--large" href="/lookbook/after-hours">
            <Image alt="Eveningwear editorial concept image" className="editorial-image" fill sizes="(max-width: 760px) 65vw, 38vw" src="/images/marcadele-hero.jpg" />
            <span>AFTER HOURS · 01</span>
          </Link>
          <Link className="home-lookbook__image home-lookbook__image--small" href="/lookbook/objects-of-form">
            <Image alt="Gold-tone earrings concept image" className="editorial-image" fill sizes="(max-width: 760px) 42vw, 24vw" src="/images/product-gold-earrings.jpg" />
            <span>OBJECTS OF FORM · 02</span>
          </Link>
        </div>
      </section>

      <section className="home-manifesto">
        <p className="eyebrow">A Marcadele point of view</p>
        <h2>“The best style feels<br /><em>like your own.”</em></h2>
        <p>A brand thought in progress · Oregon, USA</p>
        <Link className="home-manifesto__link" href="/about">More about the concept <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
