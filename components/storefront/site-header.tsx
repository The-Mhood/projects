"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useStorefrontCart } from "@/context/storefront-cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { SearchDialog } from "@/components/storefront/search-dialog";

const navigation = [
  { label: "New in", href: "/new-in" },
  { label: "Shop all", href: "/shop" },
  { label: "Clothing", href: "/clothing" },
  { label: "Bags", href: "/bags" },
  { label: "Shoes", href: "/shoes" },
  { label: "Jewelry", href: "/jewelry" },
  { label: "Designers", href: "/designers" },
  { label: "Lookbook", href: "/lookbook" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPocMode = searchParams.get("mode") === "poc";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { items: pocItems } = useCart();
  const { items: previewItems, openCart } = useStorefrontCart();
  const { slugs: wishlistSlugs } = useWishlist();
  const bagQuantity = (isPocMode ? pocItems : previewItems).reduce((sum, item) => sum + item.quantity, 0);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <>
      <div className="site-header-shell">
        <div className="preview-ribbon">
          <span className="preview-ribbon__location">OREGON, USA</span>
          <span className="preview-ribbon__message">PRESENTATION PREVIEW <i aria-hidden="true">·</i> PRODUCTS & PRICES ARE ILLUSTRATIVE</span>
          <Link className="preview-ribbon__link" href="/about">The concept <span aria-hidden="true">↗</span></Link>
        </div>
        <header className="site-header">
          <button aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} className="header-mobile-menu icon-button" onClick={() => setMobileMenuOpen((current) => !current)} type="button">
            {mobileMenuOpen ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
          </button>
          <Link aria-label="Marcadele home" className="brand-lockup" href="/" onClick={closeMobileMenu}>
            <Image alt="" className="brand-lockup__wordmark" height={75} priority src="/images/marcadele-wordmark-black.png" width={596} />
            <span className="brand-lockup__caption">THE CONCEPT EDIT</span>
          </Link>

          <nav aria-label="Main navigation" className="desktop-navigation">
            {navigation.map((item) => (
              <Link aria-current={pathname === item.href ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </nav>

          <div className="header-actions">
            <button aria-label="Search the edit" className="header-action icon-button" onClick={() => setSearchOpen(true)} type="button"><Search aria-hidden="true" size={19} strokeWidth={1.5} /></button>
            <Link aria-label={`Saved pieces${wishlistSlugs.length ? `, ${wishlistSlugs.length} saved` : ""}`} className="header-action icon-button header-wishlist" href="/wishlist">
              <Heart aria-hidden="true" size={19} strokeWidth={1.5} />
              {wishlistSlugs.length > 0 && <span className="header-count">{wishlistSlugs.length}</span>}
            </Link>
            {isPocMode ? (
              <Link aria-label={`POC bag${bagQuantity ? `, ${bagQuantity} items` : ""}`} className="header-action icon-button" href="/cart?mode=poc">
                <ShoppingBag aria-hidden="true" size={19} strokeWidth={1.5} />
                <span className="header-count">{bagQuantity}</span>
              </Link>
            ) : (
              <button aria-label={`Open preview bag${bagQuantity ? `, ${bagQuantity} items` : ""}`} className="header-action icon-button" onClick={openCart} type="button">
                <ShoppingBag aria-hidden="true" size={19} strokeWidth={1.5} />
                <span className="header-count">{bagQuantity}</span>
              </button>
            )}
          </div>
        </header>

        {mobileMenuOpen && (
          <nav aria-label="Mobile navigation" className="mobile-navigation">
            <div className="mobile-navigation__top"><span className="eyebrow">Explore Marcadele</span><span className="mobile-navigation__location">OREGON · CONCEPT EDIT</span></div>
            {navigation.map((item, index) => (
              <Link className="mobile-navigation__link" href={item.href} key={item.href} onClick={closeMobileMenu}>
                <span className="mobile-navigation__number">0{index + 1}</span><span>{item.label}</span><span aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link className="mobile-navigation__utility" href="/about" onClick={closeMobileMenu}>About the concept</Link>
          </nav>
        )}
      </div>
      <SearchDialog onClose={() => setSearchOpen(false)} open={searchOpen} />
    </>
  );
}
