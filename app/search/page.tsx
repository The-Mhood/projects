import Link from "next/link";
import { findPreviewProducts, PREVIEW_NOTICE } from "@/lib/demo/catalog";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata = { title: "Search the edit · Marcadele" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const products = query ? findPreviewProducts({ query }) : [];

  return (
    <main className="search-page page-container">
      <section className="search-page__intro"><p className="eyebrow">Within the concept collection</p><h1 className="display-title">Search the edit</h1><p className="lead-copy">{query ? `Illustrative matches for “${query}”.` : "Enter a phrase to explore the illustrative catalog."}</p><p className="collection-intro__note">{PREVIEW_NOTICE}</p></section>
      <form action="/search" className="search-page__form"><label className="sr-only" htmlFor="search-query">Search term</label><input defaultValue={query} id="search-query" name="q" placeholder="Try “evening”, “bag”, or “gold”"/><button className="button button--dark" type="submit">Search</button></form>
      {query && <><div className="collection-controls"><p><strong>{products.length.toString().padStart(2, "0")}</strong> illustrative result{products.length === 1 ? "" : "s"}</p><Link className="text-link" href="/shop">Return to the edit <span aria-hidden="true">↗</span></Link></div><ProductGrid products={products} /></>}
    </main>
  );
}
