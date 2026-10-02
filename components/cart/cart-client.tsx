"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";

type QuoteItem = {
  variantId: string;
  productName: string;
  designerName: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type CartQuote = {
  items: QuoteItem[];
  subtotalCents: number;
  currency: "usd";
};

type QuoteState = {
  key: string;
  status: "idle" | "success" | "error";
  quote?: CartQuote;
  error?: string;
};

class UserFacingRequestError extends Error {}

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function CartClient() {
  const { items, status, error: cartError, setQuantity, removeLine } = useCart();
  const [quoteState, setQuoteState] = useState<QuoteState>({ key: "", status: "idle" });
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "error">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const cartKey = useMemo(
    () => items.map((item) => `${item.variantId}:${item.quantity}`).sort().join("|"),
    [items],
  );
  const quoteIsCurrent = quoteState.key === cartKey;
  const quote = quoteIsCurrent ? quoteState.quote ?? null : null;
  const quoteStatus = items.length === 0
    ? "success"
    : status === "loading" || !quoteIsCurrent
      ? "loading"
      : quoteState.status;
  const quoteError = quoteIsCurrent ? quoteState.error ?? null : null;

  useEffect(() => {
    if (status === "loading" || items.length === 0) return;
    let active = true;
    const key = cartKey;

    void fetch("/api/cart/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message =
            typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
              ? payload.error
              : "The bag could not be priced right now.";
          throw new UserFacingRequestError(message);
        }
        return payload as CartQuote;
      })
      .then((payload) => {
        if (active) setQuoteState({ key, status: "success", quote: payload });
      })
      .catch((error: unknown) => {
        if (active) {
          setQuoteState({
            key,
            status: "error",
            error: error instanceof UserFacingRequestError ? error.message : "The bag could not be priced right now. Please retry."
          });
        }
      });

    return () => {
      active = false;
    };
  }, [cartKey, items, status]);

  async function startCheckout() {
    if (!quote || quoteStatus !== "success" || status === "loading") return;
    setCheckoutStatus("loading");
    setCheckoutError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          checkoutRequestId: globalThis.crypto.randomUUID(),
          items,
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "We couldn't start checkout. Your items are still in your bag.";
        throw new Error(message);
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("checkoutUrl" in payload) ||
        typeof payload.checkoutUrl !== "string" ||
        !payload.checkoutUrl.startsWith("https://")
      ) {
        throw new UserFacingRequestError("Checkout returned an invalid destination. Your items are still in your bag.");
      }
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof UserFacingRequestError
          ? error.message
          : "We couldn't start checkout. Your items are still in your bag. Please retry.",
      );
      setCheckoutStatus("error");
    }
  }

  if (status === "loading") {
    return <p aria-live="polite" className="text-sm text-[#5f5851]">Loading your bag…</p>;
  }

  if (cartError) {
    return (
      <section aria-labelledby="bag-title" className="space-y-4">
        <h1 className="font-serif text-4xl" id="bag-title">Your Bag</h1>
        <p role="alert" className="text-sm text-red-800">{cartError}</p>
        <p className="text-sm text-[#5f5851]">The saved bag was not changed. Clear site storage only if you want to discard it.</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section aria-labelledby="bag-title" className="space-y-5">
        <h1 className="font-serif text-4xl" id="bag-title">Your Bag</h1>
        <p className="text-[#5f5851]">Your bag is empty.</p>
        <Link className="inline-flex min-h-12 items-center bg-[#111111] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white" href="/product/demo-satin-dress?mode=poc">
          View POC product
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="bag-title" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6d37]">Commerce POC</p>
          <h1 className="mt-2 font-serif text-4xl" id="bag-title">Your Bag</h1>
        </div>
        <Link className="text-sm underline underline-offset-4" href="/product/demo-satin-dress?mode=poc">Continue shopping</Link>
      </div>

      {quoteStatus === "loading" && <p aria-live="polite" className="text-sm text-[#5f5851]">Checking current prices and availability…</p>}
      {quoteError && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-900">{quoteError}</p>}

      <ul className="divide-y divide-[#d8d0c6] border-y border-[#d8d0c6]">
        {items.map((line) => {
          const detail = quote?.items.find((item) => item.variantId === line.variantId);
          return (
            <li className="grid gap-4 py-5 sm:grid-cols-[1fr_auto]" key={line.variantId}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6c5a3e]">
                  {detail?.designerName ?? "Catalog item"}
                </p>
                <h2 className="mt-1 font-serif text-2xl">{detail?.productName ?? "Loading item…"}</h2>
                <p className="mt-1 text-sm text-[#5f5851]">
                  {[detail?.color, detail?.size].filter(Boolean).join(" · ") || detail?.sku || ""}
                </p>
                {detail && <p className="mt-2 text-sm">{formatUsd(detail.unitPriceCents)}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <label className="sr-only" htmlFor={`quantity-${line.variantId}`}>Quantity for {detail?.productName ?? "item"}</label>
                <select
                  className="min-h-10 border border-[#b8ada0] bg-white px-2"
                  id={`quantity-${line.variantId}`}
                  value={line.quantity}
                  onChange={(event) => void setQuantity(line.variantId, Number(event.target.value))}
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((quantity) => (
                    <option key={quantity} value={quantity}>{quantity}</option>
                  ))}
                </select>
                {detail && <span className="min-w-24 text-right text-sm">{formatUsd(detail.lineTotalCents)}</span>}
                <button className="min-h-10 px-2 text-sm underline underline-offset-4" type="button" onClick={() => void removeLine(line.variantId)}>
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {quote && quoteStatus === "success" && (
        <div className="ml-auto max-w-sm space-y-3 border-t border-[#d8d0c6] pt-5">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatUsd(quote.subtotalCents)}</span></div>
          <p className="text-sm text-[#5f5851]">Shipping and tax are not configured in this POC. Do not use it for real purchases.</p>
          <button
            className="min-h-12 w-full bg-[#111111] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-wait disabled:opacity-60"
            type="button"
            disabled={checkoutStatus === "loading"}
            onClick={() => void startCheckout()}
          >
            {checkoutStatus === "loading" ? "Opening secure test checkout…" : "Checkout (test mode)"}
          </button>
          {checkoutError && <p role="alert" className="text-sm text-red-800">{checkoutError}</p>}
        </div>
      )}
    </section>
  );
}
