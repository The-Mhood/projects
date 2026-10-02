import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "About the concept · Marcadele" };

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero page-container">
        <div className="about-hero__copy"><p className="eyebrow">The idea behind the edit</p><h1 className="display-title">A thoughtful way<br /><em>to find your style.</em></h1><p className="lead-copy">Marcadele is being shaped as an elevated destination for fashion discovery, built around a distinctive point of view and a more considered digital experience.</p><Link className="button button--dark" href="/shop">Explore the presentation <span aria-hidden="true">↗</span></Link></div>
        <div className="about-hero__image"><Image alt="Editorial image created for the Marcadele concept presentation" className="editorial-image" fill priority sizes="(max-width: 800px) 100vw, 50vw" src="/images/marcadele-hero.jpg" /><span>OREGON, USA · PRESENTATION CONCEPT</span></div>
      </section>
      <section className="about-point-of-view">
        <div><p className="eyebrow">The point of view</p><span className="about-point-of-view__mark">M.</span></div>
        <div className="about-point-of-view__copy"><h2>Less noise.<br /><em>More point of view.</em></h2><p>This concept explores a fashion destination where considered curation, expressive imagery, and useful product context work together. It is a design direction in progress, not a claim about a launched assortment or confirmed operating services.</p><p>Marcadele is based in Oregon, USA. Further brand, assortment, and fulfillment details are being developed by the owner.</p></div>
      </section>
      <section className="about-pillars page-container">
        <p className="eyebrow">An experience to shape</p>
        <h2>Made to feel personal.</h2>
        <div className="about-pillar-grid"><article><span>01</span><h3>A clear point of view</h3><p>An editorial lens that helps a customer explore style with intention.</p></article><article><span>02</span><h3>Details with context</h3><p>Product information designed to make discovery feel thoughtful and clear.</p></article><article><span>03</span><h3>Room to express</h3><p>A digital experience centered on individuality, discovery, and personal style.</p></article></div>
      </section>
      <section className="about-cta"><p className="eyebrow">The story is taking shape</p><h2>Come explore<br /><em>the concept.</em></h2><Link className="button button--light" href="/lookbook">View the lookbook <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}
