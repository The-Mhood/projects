import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function paymentIntentId(value: Stripe.Checkout.Session["payment_intent"]): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.id;
  return null;
}

export async function POST(request: Request) {
  if (process.env.MARCADELE_POC_ONLY !== "true") {
    return NextResponse.json({ error: "Webhook processing is disabled outside the explicit POC configuration." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }
  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured.");
    return NextResponse.json({ error: "Webhook endpoint is not configured." }, { status: 503 });
  }

  let stripe: ReturnType<typeof getStripeClient>;
  try {
    stripe = getStripeClient();
  } catch (error) {
    console.error("Stripe server credentials are not configured:", error);
    return NextResponse.json({ error: "Webhook endpoint is not configured." }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const handledTypes = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ]);
  if (!handledTypes.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (!orderId || !UUID_PATTERN.test(orderId) || typeof session.id !== "string") {
    console.error("Stripe POC event did not include a valid internal order reference.", event.id, event.type);
    return NextResponse.json({ error: "The checkout event is missing its order reference." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    let result;
    let error;

    if (
      (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") &&
      session.payment_status === "paid"
    ) {
      ({ data: result, error } = await supabase.rpc("mark_order_paid", {
        p_event_id: event.id,
        p_event_type: event.type,
        p_order_id: orderId,
        p_session_id: session.id,
        p_payment_intent_id: paymentIntentId(session.payment_intent),
      }));
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      ({ data: result, error } = await supabase.rpc("release_order_reservation", {
        p_order_id: orderId,
        p_session_id: session.id,
        p_reason: event.type === "checkout.session.expired" ? "expired" : "failed",
        p_event_id: event.id,
        p_event_type: event.type,
      }));
    } else if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      // A delayed payment method has not settled yet. Its async event will finalize or release the order.
      return NextResponse.json({ received: true, awaitingPayment: true });
    } else {
      return NextResponse.json({ received: true, ignored: true });
    }

    if (error) {
      console.error("Stripe webhook database transaction failed:", error, { eventId: event.id, eventType: event.type });
      return NextResponse.json({ error: "Webhook processing failed; Stripe may retry this event." }, { status: 500 });
    }

    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error, { eventId: event.id, eventType: event.type });
    return NextResponse.json({ error: "Webhook processing failed; Stripe may retry this event." }, { status: 500 });
  }
}
