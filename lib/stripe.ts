import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripeClient(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
  if (!secret.startsWith("sk_test_")) throw new Error("The Marcadele POC accepts test-mode Stripe secret keys only.");
  stripeClient ??= new Stripe(secret);
  return stripeClient;
}
