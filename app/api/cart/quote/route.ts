import { NextResponse } from "next/server";
import { parseCartLines } from "@/lib/checkout/validation.js";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type VariantQuoteRow = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price_cents: number;
  inventory_quantity: number;
  reserved_quantity: number;
  active: boolean;
  products: { name: string; designer_name: string; status: string } | null;
};

export async function POST(request: Request) {
  let lines: ReturnType<typeof parseCartLines>;
  try {
    const body: unknown = await request.json();
    const items = typeof body === "object" && body !== null && "items" in body ? body.items : null;
    lines = parseCartLines(items);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "The bag request is invalid.", 400);
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, sku, size, color, price_cents, inventory_quantity, reserved_quantity, active, products!inner(name, designer_name, status)")
      .in("id", lines.map((line) => line.variantId))
      .eq("active", true)
      .eq("products.status", "active")
      .eq("products.is_demo", true);

    if (error) throw error;
    const variants = (data ?? []) as unknown as VariantQuoteRow[];
    const byId = new Map(variants.map((variant) => [variant.id, variant]));
    const quoteItems = [];

    for (const line of lines) {
      const variant = byId.get(line.variantId);
      if (!variant || !variant.products) {
        return errorResponse("One of the selected items is no longer available.", 409);
      }
      const availableQuantity = variant.inventory_quantity - variant.reserved_quantity;
      if (availableQuantity < line.quantity) {
        return errorResponse("The selected quantity is no longer available. Update your bag and try again.", 409);
      }
      quoteItems.push({
        variantId: variant.id,
        productName: variant.products.name,
        designerName: variant.products.designer_name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        quantity: line.quantity,
        unitPriceCents: Number(variant.price_cents),
        lineTotalCents: Number(variant.price_cents) * line.quantity,
      });
    }

    return NextResponse.json({
      items: quoteItems,
      subtotalCents: quoteItems.reduce((sum, item) => sum + item.lineTotalCents, 0),
      currency: "usd",
    });
  } catch (error) {
    console.error("POC cart quote failed:", error);
    const message = error instanceof Error && error.message.startsWith("Missing required environment variable:")
      ? "Catalog pricing is not configured yet. Add the Supabase environment variables and apply the POC migration."
      : "Current prices and availability could not be loaded. Please retry.";
    return errorResponse(message, 503);
  }
}
