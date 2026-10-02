import { CartClient } from "@/components/cart/cart-client";
import { PreviewCartPage } from "@/components/storefront/preview-cart-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Bag · Marcadele" };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const query = await searchParams;
  if (query.mode === "poc") {
    return <main className="poc-cart-shell"><CartClient /></main>;
  }
  return <main className="page-container cart-shell"><PreviewCartPage /></main>;
}
