import Link from "next/link";

export const metadata = { title: "Your space · Marcadele Concept" };

export default function AccountPage() {
  return (
    <main className="account-page page-container">
      <span aria-hidden="true" className="account-page__mark">M</span>
      <p className="eyebrow">A more personal experience</p>
      <h1 className="display-title">Your space,<br /><em>in the making.</em></h1>
      <p className="lead-copy">A future Marcadele account could bring saved pieces and personal preferences together. Authentication and account services are not connected in this presentation preview.</p>
      <div className="account-page__actions"><Link className="button button--dark" href="/wishlist">View saved pieces <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/about">About the concept <span aria-hidden="true">↗</span></Link></div>
    </main>
  );
}
