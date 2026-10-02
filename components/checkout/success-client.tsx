"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/cart-context";

type PaymentState = "confirmed" | "webhook-pending" | "not-confirmed";

export function SuccessClient({
  orderNumber,
  sessionId,
  state,
}: {
  orderNumber: string | null;
  sessionId: string | null;
  state: PaymentState;
}) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (state === "confirmed") void clearCart();
  }, [clearCart, state]);

  const heading = state === "confirmed"
    ? "Thank you"
    : state === "webhook-pending"
      ? "Payment received"
      : "Payment not confirmed";

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6d37]">Marcadele · Oregon, USA · test checkout</p>
      <h1 className="mt-4 font-serif text-5xl">{heading}</h1>
      {state === "confirmed" && (
        <p className="mt-5 text-[#5f5851]">Stripe and the verified webhook confirmed this test payment. No real order has been placed.</p>
      )}
      {state === "webhook-pending" && (
        <p className="mt-5 text-[#5f5851]">Stripe reports the test payment as complete. The order update is still processing; refresh this page shortly. Your bag is unchanged until the order is confirmed.</p>
      )}
      {state === "not-confirmed" && (
        <p className="mt-5 text-[#5f5851]">This page does not prove payment. Check Stripe test mode or return to your bag if checkout was cancelled.</p>
      )}
      {orderNumber && <p className="mt-3 text-sm">POC order reference: <strong>{orderNumber}</strong></p>}
      <div className="mt-8 flex flex-wrap gap-4">
        {state === "webhook-pending" && (
          <Link className="inline-flex min-h-12 items-center border border-[#b8ada0] px-6 text-sm font-semibold uppercase tracking-[0.12em]" href={sessionId ? `/checkout/success?mode=poc&session_id=${encodeURIComponent(sessionId)}` : "/checkout/success?mode=poc"}>
            Refresh status
          </Link>
        )}
        <Link className="inline-flex min-h-12 items-center bg-[#111111] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white" href="/poc">
          Return to POC status
        </Link>
      </div>
    </main>
  );
}
