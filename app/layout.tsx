import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Marcadele — The Concept Edit",
    template: "%s · Marcadele",
  },
  description: "An investor-facing visual concept for Marcadele, based in Oregon, USA. Product imagery and catalog content are illustrative only.",
};

function HeaderFallback() {
  return <div aria-hidden="true" className="header-fallback"><span>Marcadele</span></div>;
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body id="top">
        <Providers>
          <Suspense fallback={<HeaderFallback />}><SiteHeader /></Suspense>
          {children}
          <SiteFooter />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
