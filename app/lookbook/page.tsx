import Image from "next/image";
import Link from "next/link";
import { PREVIEW_COLLECTIONS } from "@/lib/demo/catalog";

export const metadata = { title: "Lookbook · Marcadele Concept" };

export default function LookbookPage() {
  return (
    <main className="lookbook-page page-container">
      <section className="editorial-page__intro lookbook-intro">
        <p className="eyebrow">Fashion, feeling, form</p>
        <h1 className="display-title">The Marcadele lookbook</h1>
        <p className="lead-copy">An editorial world in progress — visual stories created to explore the spirit of the concept.</p>
        <p className="collection-intro__note">All imagery and styling are illustrative presentation assets.</p>
      </section>
      <div className="lookbook-grid">
        {PREVIEW_COLLECTIONS.map((story, index) => (
          <Link className={`lookbook-card lookbook-card--${index + 1}`} href={`/lookbook/${story.slug}`} key={story.slug}>
            <div className="lookbook-card__image"><Image alt={story.imageAlt} className="editorial-image" fill sizes="(max-width: 760px) 100vw, 50vw" src={story.image} /><span className="lookbook-card__index">0{index + 1}</span><span className="lookbook-card__arrow">↗</span></div>
            <p className="eyebrow">{story.subtitle}</p>
            <h2>{story.title}</h2>
            <p>{story.description}</p>
            <span className="text-link">Enter the story <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
      <section className="lookbook-closing"><span aria-hidden="true">M</span><p className="eyebrow">A visual language in progress</p><h2>Wear your own<br /><em>point of view.</em></h2><Link className="button button--dark" href="/shop">Explore the concept edit <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}
