import { SuccessClient } from "@/components/checkout/success-client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout status · Marcadele POC" };

type OrderStatus = { order_number: string; payment_status: string };
type Verification = {
  orderNumber: string | null;
  state: "confirmed" | "webhook-pending" | "not-confirmed";
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let verification: Verification = { orderNumber: null, state: "not-confirmed" };

  if (sessionId) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
      const orderId = session.metadata?.order_id;
      if (session.status === "complete" && session.payment_status === "paid" && orderId) {
        const supabase = createAdminSupabaseClient();
        const { data, error } = await supabase
          .from("orders")
          .select("order_number, payment_status")
          .eq("id", orderId)
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

        if (error) throw error;
        const order = data as OrderStatus | null;
        verification = {
          orderNumber: order?.order_number ?? null,
          state: order?.payment_status === "paid" ? "confirmed" : "webhook-pending",
        };
      }
    } catch (error) {
      console.error("POC success-page verification failed:", error);
    }
  }

  return <SuccessClient orderNumber={verification.orderNumber} sessionId={sessionId ?? null} state={verification.state} />;
}
