"use client";

import type { ReactNode } from "react";
import { StorefrontCartProvider } from "@/context/storefront-cart-context";
import { WishlistProvider } from "@/context/wishlist-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StorefrontCartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </StorefrontCartProvider>
  );
}
