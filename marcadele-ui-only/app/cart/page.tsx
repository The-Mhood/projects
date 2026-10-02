import { PreviewCartPage } from "@/components/storefront/preview-cart-page";

export const metadata = { title: "Your Bag · Marcadele" };

export default function CartPage() {
  return <main className="page-container cart-shell"><PreviewCartPage /></main>;
}
