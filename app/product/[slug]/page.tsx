import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBagButton } from "@/components/cart/add-to-bag-button";
import { ProductDetail } from "@/components/product/product-detail";
import { getPreviewProductBySlug } from "@/lib/demo/catalog";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

 type ProductPageData = {
  id: string;
  slug: string;
  name: string;
  designer_name: string;
  description: string;
  is_demo: boolean;
  product_variants: Array<{
    id: string;
    sku: string;
    size: string | null;
    color: string | null;
    price_cents: number;
    inventory_quantity: number;
    reserved_quantity: number;
    active: boolean;
  }>;
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (query.mode === "poc") return <PocProductPage slug={slug} />;

  const product = getPreviewProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}

async function PocProductPage({ slug }: { slug: string }) {
  let product: ProductPageData | null = null;
  let loadError: string | null = null;

  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, designer_name, description, is_demo")
      .eq("slug", slug)
      .eq("status", "active")
      .eq("is_demo", true)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      const admin = createAdminSupabaseClient();
      const { data: variantRows, error: variantError } = await admin
        .from("product_variants")
        .select("id, sku, size, color, price_cents, inventory_quantity, reserved_quantity, active")
        .eq("product_id", data.id)
        .eq("active", true);
      if (variantError) throw variantError;
      product = {
        ...(data as unknown as Omit<ProductPageData, "product_variants">),
        product_variants: (variantRows ?? []) as unknown as ProductPageData["product_variants"],
      };
    }
  } catch (error) {
    console.error("POC product query failed:", error);
    loadError = error instanceof Error && error.message.startsWith("Missing required environment variable:")
      ? "Supabase is not configured. Add the required values to your private .env.local file, apply the migration, and seed the demo product."
      : "The product could not be loaded from Supabase. Check the server log and Supabase connection.";
  }

  if (loadError) {
    return (
      <main className="poc-status-page">
        <p className="eyebrow">Technical integration path</p>
        <h1 className="display-title">POC product unavailable</h1>
        <p className="lead-copy" role="alert">{loadError}</p>
        <Link className="button button--dark" href="/poc">View POC setup status</Link>
      </main>
    );
  }

  if (!product) notFound();

  const activeVariants = product.product_variants.filter((variant) => variant.active);
  const availableVariants = activeVariants.filter((variant) => variant.inventory_quantity - variant.reserved_quantity > 0);
  const prices = activeVariants.map((variant) => variant.price_cents);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <main className="poc-product-page">
      <section aria-label="POC product imagery placeholder" className="poc-product-image">
        <div><p className="eyebrow">POC imagery placeholder</p><p>Approved product photography is required before launch.</p></div>
      </section>
      <section className="poc-product-info">
        <p className="eyebrow">{product.designer_name}</p>
        <h1 className="display-title">{product.name}</h1>
        <p className="poc-product-info__price">{lowestPrice === null ? "Price unavailable" : formatUsd(lowestPrice)}</p>
        <p className="lead-copy">{product.description || "Product details have not been supplied."}</p>
        <p className="poc-notice">Fictional development data. This product is not for sale and does not represent a real Marcadele designer relationship.</p>
        <div className="poc-add-to-bag">
          <AddToBagButton variants={activeVariants.map((variant) => ({
            id: variant.id,
            label: [variant.color, variant.size].filter(Boolean).join(" · ") || variant.sku,
            available: variant.inventory_quantity - variant.reserved_quantity > 0,
          }))} />
        </div>
        <p className="micro-copy">{availableVariants.length} available demo option{availableVariants.length === 1 ? "" : "s"}. Inventory is rechecked by the server at checkout.</p>
        <Link className="text-link" href="/poc">POC setup and integration notes <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
