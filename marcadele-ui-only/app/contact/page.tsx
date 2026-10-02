import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "Contact · Marcadele Concept" };

export default function ContactPage() {
  return (
    <main className="contact-page page-container">
      <div className="contact-page__symbol" aria-hidden="true">M.</div>
      <p className="eyebrow">A conversation, in time</p>
      <h1 className="display-title">Let’s stay<br /><em>in touch.</em></h1>
      <p className="lead-copy">The Marcadele experience is currently a presentation concept. An approved contact channel has not yet been added, so this page does not collect or send messages.</p>
      <div className="contact-page__rule" />
      <div className="contact-page__details"><span>LOCATION</span><strong>Oregon, USA</strong><span>CONTACT CHANNEL</span><strong>To be confirmed by the brand owner</strong></div>
      <div className="contact-page__links"><Link className="text-link" href="/faq">Read the preview notes <ArrowUpRight aria-hidden="true" size={15} /></Link><Link className="text-link" href="/about">Discover the concept <ArrowUpRight aria-hidden="true" size={15} /></Link></div>
    </main>
  );
}
