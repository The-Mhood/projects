"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";

export function WishlistButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { contains, toggle, status } = useWishlist();
  const saved = contains(slug);

  return (
    <button
      aria-label={saved ? "Remove from saved pieces" : "Save this piece"}
      aria-pressed={saved}
      className={`icon-button wishlist-button ${saved ? "is-saved" : ""} ${className}`.trim()}
      disabled={status === "loading"}
      onClick={() => void toggle(slug)}
      type="button"
    >
      <Heart aria-hidden="true" fill={saved ? "currentColor" : "none"} size={18} strokeWidth={1.5} />
    </button>
  );
}
