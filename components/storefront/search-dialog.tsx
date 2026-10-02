"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { findPreviewProducts, formatPreviewUsd, PREVIEW_PRODUCTS } from "@/lib/demo/catalog";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = query.trim() ? findPreviewProducts({ query }).slice(0, 4) : PREVIEW_PRODUCTS.slice(0, 3);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = query.trim();
    if (cleaned) router.push(`/search?q=${encodeURIComponent(cleaned)}`);
    onClose();
  }

  return (
    <div className="search-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section aria-labelledby="search-title" aria-modal="true" className="search-dialog" role="dialog">
        <div className="search-dialog__heading">
          <div><p className="eyebrow">Find your point of view</p><h2 id="search-title">Search the edit</h2></div>
          <button aria-label="Close search" className="icon-button" onClick={onClose} type="button"><X aria-hidden="true" size={20} /></button>
        </div>
        <form className="search-dialog__form" onSubmit={handleSubmit}>
          <Search aria-hidden="true" size={19} strokeWidth={1.5} />
          <label className="sr-only" htmlFor="store-search">Search products</label>
          <input autoComplete="off" id="store-search" onChange={(event) => setQuery(event.target.value)} placeholder="Try “evening” or “bags”" ref={inputRef} value={query} />
          <button type="submit">Search</button>
        </form>
        <div className="search-dialog__results">
          <div className="search-dialog__results-heading"><span>{query.trim() ? "Preview matches" : "A few pieces to explore"}</span><span>Illustrative edit</span></div>
          {results.length > 0 ? results.map((product) => (
            <Link className="search-result" href={`/product/${product.slug}`} key={product.id} onClick={onClose}>
              <span className="search-result__image"><Image alt={product.imageAlt} fill sizes="56px" src={product.image} /></span>
              <span className="search-result__copy"><span className="product-card__designer">{product.editLabel}</span><strong>{product.name}</strong></span>
              <span className="search-result__price">{formatPreviewUsd(product.priceCents)}</span>
            </Link>
          )) : <p className="search-dialog__empty">No illustrative pieces match that search. Try a different phrase.</p>}
        </div>
        <p className="micro-copy">Search works locally within the concept catalog. No information is sent.</p>
      </section>
    </div>
  );
}
