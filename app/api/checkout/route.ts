import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { parseCartLines } from "@/lib/checkout/validation.js";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CheckoutItem = {
  variantId: string;
  productName: string;
  designerName: string;
  sku: string;
  selectedOptions: Record<string, string>;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type CheckoutOrder = {
  orderId: string;
  orderNumber: string;
  currency: "usd";
  subtotalCents: number;
  items: CheckoutItem[];
};

function isCheckoutOrder(value: unknown): value is CheckoutOrder {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Partial<CheckoutOrder>;
  return (
    typeof order.orderId === "string" &&
    UUID_PATTERN.test(order.orderId) &&
    typeof order.orderNumber === "string" &&
    order.currency === "usd" &&
    Number.isSafeInteger(order.subtotalCents) &&
    Array.isArray(order.items) &&
    order.items.every(
      (item) =>
        typeof item.variantId === "string" &&
        typeof item.productName === "string" &&
        typeof item.designerName === "string" &&
        Number.isSafeInteger(item.quantity) &&
        Number.isSafeInteger(item.unitPriceCents) &&
        Number.isSafeInteger(item.lineTotalCents),
    )
  );
}

function originFromEnvironment(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) throw new Error("Missing required environment variable: NEXT_PUBLIC_SITE_URL");
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS outside localhost.");
  }
  return url.origin;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (process.env.MARCADELE_POC_ONLY !== "true") {
    return errorResponse("Checkout is disabled unless the explicit POC-only flag is enabled.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("The checkout request is not valid JSON.", 400);
  }

  if (typeof body !== "object" || body === null || !("checkoutRequestId" in body) || !("items" in body)) {
    return errorResponse("The checkout request is incomplete.", 400);
  }

  const checkoutRequestId = body.checkoutRequestId;
  if (typeof checkoutRequestId !== "string" || !UUID_PATTERN.test(checkoutRequestId)) {
    return errorResponse("The checkout request identifier is invalid. Refresh your bag and try again.", 400);
  }

  let lines: ReturnType<typeof parseCartLines>;
  try {
    lines = parseCartLines(body.items);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "The bag request is invalid.", 400);
  }

  let admin: ReturnType<typeof createAdminSupabaseClient> | undefined;
  let orderId: string | undefined;
  let session: Stripe.Checkout.Session | undefined;

  try {
    const baseUrl = originFromEnvironment();
    admin = createAdminSupabaseClient();
    const reservationExpiresAt = new Date(Date.now() + 50 * 60 * 1000).toISOString();
    const { data, error } = await admin.rpc("create_pending_order", {
      p_checkout_request_id: checkoutRequestId,
      p_items: lines.map((line) => ({ variant_id: line.variantId, quantity: line.quantity })),
      p_reservation_expires_at: reservationExpiresAt,
    });

    if (error) {
      console.error("POC order reservation failed:", error);
      if (error.message.includes("OUT_OF_STOCK") || error.message.includes("VARIANT_UNAVAILABLE")) {
        return errorResponse("An item in your bag is no longer available in the selected quantity.", 409);
      }
      if (error.message.includes("CHECKOUT_REQUEST_ALREADY_FINISHED")) {
        return errorResponse("This checkout attempt has expired. Return to your bag and try again.", 409);
      }
      throw error;
    }

    if (!isCheckoutOrder(data)) {
      const possibleOrderId =
        typeof data === "object" && data !== null && "orderId" in data && typeof data.orderId === "string"
          ? data.orderId
          : undefined;
      orderId = possibleOrderId;
      throw new Error("Supabase returned an invalid checkout order payload.");
    }
    orderId = data.orderId;

    const stripeClient = getStripeClient();
    const sessionExpiresAt = Math.floor(Date.now() / 1000) + 40 * 60;
    session = await stripeClient.checkout.sessions.create(
      {
        mode: "payment",
        allowed_payment_method_types: ["card"],
        line_items: data.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: data.currency,
            unit_amount: item.unitPriceCents,
            product_data: {
              name: `${item.designerName} — ${item.productName}`,
              metadata: { sku: item.sku },
            },
          },
        })),
        shipping_address_collection: { allowed_countries: ["US"] },
        client_reference_id: data.orderId,
        metadata: { order_id: data.orderId, order_number: data.orderNumber },
        success_url: `${baseUrl}/checkout/success?mode=poc&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cart?mode=poc`,
        expires_at: sessionExpiresAt,
      },
      { idempotencyKey: `marcadele-checkout-${data.orderId}` },
    );

    const { data: savedOrder, error: saveError } = await admin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() })
      .eq("id", data.orderId)
      .eq("payment_status", "pending")
      .select("id")
      .maybeSingle();

    if (saveError) throw saveError;
    if (!savedOrder) throw new Error("The checkout session could not be attached to the pending order.");
    if (!session.url) throw new Error("Stripe did not return a hosted checkout URL.");

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("POC checkout creation failed:", error);

    if (admin && orderId) {
      let safeToRelease = !session;
      if (session) {
        try {
          await getStripeClient().checkout.sessions.expire(session.id);
          safeToRelease = true;
        } catch (expireError) {
          console.error("POC could not expire an unlinked Stripe session; reservation will expire by timeout:", expireError);
        }
      }
      if (safeToRelease) {
        const { error: releaseError } = await admin.rpc("release_order_reservation", {
          p_order_id: orderId,
          p_session_id: session?.id ?? null,
          p_reason: "failed",
          p_event_id: null,
          p_event_type: null,
        });
        if (releaseError) console.error("POC could not release failed-checkout reservation:", releaseError);
      }
    }

    if (error instanceof Error && error.message.startsWith("Missing required environment variable:")) {
      return errorResponse("Checkout is not configured. Add the private Supabase and Stripe test values, then retry.", 503);
    }
    if (error instanceof Error && error.message.includes("NEXT_PUBLIC_SITE_URL")) {
      return errorResponse("The POC return URL is not configured correctly.", 503);
    }
    return errorResponse("We couldn't start checkout. Your items are still in your bag.", 502);
  }
}
