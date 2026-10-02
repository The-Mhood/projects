import Image from "next/image";
import Link from "next/link";
import { PREVIEW_STYLE_DIRECTIONS } from "@/lib/demo/catalog";

export const metadata = { title: "Style directions · Marcadele Concept" };

export default function DesignersPage() {
  return (
    <main className="editorial-page page-container">
      <section className="editorial-page__intro">
        <p className="eyebrow">An evolving point of view</p>
        <h1 className="display-title">Style, in its many forms.</h1>
        <p className="lead-copy">Rather than a roster of collaborators, this presentation explores three creative directions that could shape the Marcadele experience.</p>
        <p className="collection-intro__note">The directions and imagery below are illustrative. No designer relationships are represented.</p>
      </section>
      <div className="direction-grid">
        {PREVIEW_STYLE_DIRECTIONS.map((direction, index) => (
          <Link className="direction-card" href={`/designers/${direction.slug}`} key={direction.slug}>
            <div className="direction-card__image"><Image alt={direction.imageAlt} className="editorial-image" fill sizes="(max-width: 720px) 100vw, 33vw" src={direction.image} /><span>0{index + 1} / STYLE DIRECTION</span></div>
            <p className="eyebrow">{direction.descriptor}</p>
            <h2>{direction.title}</h2>
            <p>{direction.description}</p>
            <span className="text-link">Explore this direction <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
    </main>
  );
}
