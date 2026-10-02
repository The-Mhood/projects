import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Technical POC status · Marcadele" };

export default function PocPage() {
  const checks = [
    ["NEXT_PUBLIC_SUPABASE_URL", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)],
    ["SUPABASE_URL", Boolean(process.env.SUPABASE_URL)],
    ["SUPABASE_SECRET_KEY", Boolean(process.env.SUPABASE_SECRET_KEY)],
    ["MARCADELE_POC_ONLY=true", process.env.MARCADELE_POC_ONLY === "true"],
    ["Stripe test credentials", Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && process.env.STRIPE_WEBHOOK_SECRET)],
    ["NEXT_PUBLIC_SITE_URL", Boolean(process.env.NEXT_PUBLIC_SITE_URL)],
  ] as const;
  const configured = checks.every(([, ready]) => ready);

  return (
    <main className="poc-page page-container">
      <section className="poc-page__intro"><p className="eyebrow">Separate technical track</p><h1 className="display-title">Commerce POC<br /><em>integration status.</em></h1><p className="lead-copy">This route is for validating the existing Supabase and Stripe test integration. It is not part of the investor-facing catalog.</p></section>
      <div className={`poc-status-card ${configured ? "poc-status-card--ready" : "poc-status-card--waiting"}`}><span className="poc-status-card__dot"/><div><p className="eyebrow">Environment readiness</p><h2>{configured ? "Required settings are present" : "Service configuration is not complete"}</h2><p>{configured ? "This only checks whether expected environment variables are present. It does not prove service connectivity or successful integration tests." : "This workspace currently lacks one or more required private service settings. No real checkout or webhook acceptance is claimed."}</p></div></div>
      <div className="poc-check-list">{checks.map(([label, ready]) => <div className="poc-check" key={label}><span>{label}</span><strong className={ready ? "is-ready" : "is-missing"}>{ready ? "Configured" : "Not configured"}</strong></div>)}</div>
      <div className="poc-page__actions"><Link className="button button--dark" href="/product/demo-satin-dress?mode=poc">Open the Supabase demo product <span aria-hidden="true">↗</span></Link><Link className="button button--outline" href="/cart?mode=poc">Open the POC bag</Link></div>
      <p className="poc-page__note">The POC bag uses separate browser storage from the illustrative presentation bag. Checkout is guarded for test mode and requires the explicit POC-only configuration.</p>
      <div className="poc-page__back"><Link className="text-link" href="/">Return to the presentation preview <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/faq">Review the presentation notes <span aria-hidden="true">↗</span></Link></div>
    </main>
  );
}
