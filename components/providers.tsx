"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/cart-context";
import { StorefrontCartProvider } from "@/context/storefront-cart-context";
import { WishlistProvider } from "@/context/wishlist-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <StorefrontCartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </StorefrontCartProvider>
    </CartProvider>
  );
}
