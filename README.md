# Marcadele presentation preview & commerce POC

This repository contains two intentionally separate experiences:

1. The default site is a polished, investor-facing **visual presentation concept** for Marcadele.
2. A technical Supabase/Stripe proof of concept remains available on explicitly marked `/poc` routes.

The provided brand location is **Oregon, USA**. No city, street address, fulfillment origin, or delivery promise is asserted.

## Investor presentation preview

Start the app and open `/`. The preview includes responsive navigation, concept collections, search, product pages, locally saved pieces, and a presentation bag. The catalog imagery, product names, options, designer labels, and prices are illustrative only. They do not represent real inventory, designer relationships, authenticity, or sale offers; nothing is available to purchase.

The preview bag at `/cart` stores only sample variant IDs and quantities in its own browser-storage key. It does not call the POC quote/checkout APIs. Its checkout control explains that no payment, reservation, or order can be created. Wishlist and newsletter interactions are local visual previews; the newsletter form does not transmit or save email addresses. Account authentication is not connected.

Helpful investor walkthrough routes include `/shop`, `/new-in`, `/designers`, `/lookbook`, `/about`, `/wishlist`, and `/faq`.

## Technical POC boundaries

The real integration track is explicitly separated from the investor preview:

- `/poc` shows whether required environment variables are present. This does **not** prove service connectivity or acceptance.
- `/product/demo-satin-dress?mode=poc` reads the fictional, explicitly demo-marked product from Supabase.
- `/cart?mode=poc` uses the existing POC guest cart, fetches a server-priced quote, and can start a guarded Stripe **test-mode** Checkout Session.
- The POC cart uses `marcadele.poc.guest-cart.v1`; the presentation cart uses `marcadele.preview.guest-cart.v1`. They are deliberately separate.
- `/api/cart/quote`, `/api/checkout`, and `/api/stripe/webhook` remain the integration APIs.

The POC validates a small number of real integration boundaries:

- Read an active, explicitly demo-marked product from Supabase.
- Persist a guest bag containing only variant IDs and quantities.
- Re-fetch prices and availability on the server; never accept a client-supplied price or expose stock counts to the browser.
- Atomically reserve inventory and create an order snapshot in Postgres before creating a Stripe Checkout Session.
- Verify Stripe webhook signatures, process paid/expired sessions transactionally, and apply inventory changes idempotently.

It does **not** implement production authentication, account services, admin, catalog image uploads, email, real shipping rates, tax configuration, discounts, reviews, or production policies. Do not use this test checkout for real purchases.

## Requirements and private configuration

- Node.js 22 or newer
- A development Supabase project
- A Stripe account in test mode
- Stripe CLI for local webhook forwarding (install and authenticate separately)

No secrets should be sent in chat or committed. Copy `.env.example` to `.env.local` and fill it in privately:

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (server only; never use a `NEXT_PUBLIC_` prefix)
- `MARCADELE_POC_ONLY=true` (required guard; checkout/webhook routes refuse to run without it)
- `STRIPE_SECRET_KEY` (must be a test-mode `sk_test_` key; live keys are rejected)
- `STRIPE_WEBHOOK_SECRET` (from the Stripe CLI listener)
- `NEXT_PUBLIC_SITE_URL` (for local testing, `http://localhost:3000`)

## Supabase setup

Apply `supabase/migrations/0001_poc_commerce.sql` to a **development/test project**, then run `supabase/seed.sql`. The seed creates one clearly fictional `Demo Atelier` product at $125.00 with two units of test inventory. The migration enables RLS, allows anonymous reads only for active product copy, denies browser access to variants/stock, orders, reservations, movements, and webhook events, and grants privileged RPCs to the server role.

For quick setup, paste each SQL file into the Supabase SQL Editor in order. Do not apply this POC migration to a production store.

## Stripe test setup

Use only Stripe test-mode credentials. After starting the Next.js app, forward events to the webhook route:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in `.env.local`, restart the Next.js process, then test a Checkout Session using Stripe's test card details. The POC limits Checkout to card payments and US shipping-address collection. It does not configure actual shipping charges or taxes.

Stripe CLI is not bundled with the app. Its webhook forwarding is required to prove the real webhook boundary; a locally fabricated webhook is not an equivalent test.

## Run and validate

```bash
npm ci
npm run dev
```

For the investor experience, open `/`. For the technical POC, first configure the private development/test services and then use the explicitly marked `/poc` links.

Checks available in this repository:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## POC pass criteria

1. A real Supabase demo product is visible at `/product/demo-satin-dress?mode=poc`.
2. The POC guest bag survives a page reload and contains no client-side price data.
3. Checkout prices and item names are loaded from Supabase on the server.
4. Stripe creates a test Checkout Session and redirects to its hosted URL.
5. A real Stripe CLI-delivered, signature-verified webhook marks the order paid and reduces inventory once.
6. Re-delivering an event does not reduce inventory a second time.
7. Two checkout attempts for the final available unit cannot both reserve it.
8. Anonymous users can read active product copy but cannot read variants/stock, orders, reservations, movements, or webhook events.

## Known limitations and next decision gate

No Supabase or Stripe credentials, local `.env.local`, Supabase CLI, or Stripe CLI were available when this POC scaffold was prepared. The code can be statically checked here, but the real integration has **not** been validated. The POC remains open until the pass criteria above are run against the owner's development Supabase project and Stripe test mode.

The reservation timeout is cleaned up when Stripe reports session expiration and before a later checkout attempt. This POC has no distributed rate limiting or bot protection; keep it in a local/test environment. A production deployment also needs a reliable scheduled cleanup task for abandoned reservations, plus approved shipping, tax, return, email, authentication, admin, and Oregon fulfillment configuration.
