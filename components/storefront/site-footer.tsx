import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "@/components/storefront/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand-block">
          <Link aria-label="Marcadele home" className="footer-wordmark" href="/"><Image alt="Marcadele" className="footer-wordmark__image" height={75} src="/images/marcadele-wordmark-black.png" width={596} /></Link>
          <p className="footer-tagline">A point of view, in progress.</p>
          <p className="footer-location">OREGON, USA <span aria-hidden="true">·</span> PRESENTATION CONCEPT</p>
        </div>
        <div className="site-footer__newsletter">
          <p className="eyebrow">Stay in the conversation</p>
          <h2>Notes from the edit.</h2>
          <NewsletterForm />
        </div>
        <div className="site-footer__links">
          <p className="eyebrow">Explore</p>
          <Link href="/shop">The collection</Link>
          <Link href="/designers">Style directions</Link>
          <Link href="/lookbook">Lookbook</Link>
          <Link href="/about">Our concept</Link>
        </div>
        <div className="site-footer__links">
          <p className="eyebrow">More</p>
          <Link href="/contact">Contact concept</Link>
          <Link href="/faq">Preview notes</Link>
          <Link href="/account">Your space</Link>
          <Link href="/wishlist">Saved pieces <ArrowUpRight aria-hidden="true" size={13} /></Link>
        </div>
      </div>
      <div className="site-footer__disclaimer">
        <span>© 2026 Marcadele · Presentation preview</span>
        <p>Imagery, products, product options, and prices are illustrative concept content only. No products are available for purchase; no transaction or newsletter data is sent or saved.</p>
        <Link className="back-to-top" href="#top">Back to top ↑</Link>
      </div>
    </footer>
  );
}
