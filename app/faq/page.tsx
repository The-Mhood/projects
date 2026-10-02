import Link from "next/link";
import { PREVIEW_NOTICE } from "@/lib/demo/catalog";

export const metadata = { title: "Preview notes · Marcadele" };

const questions = [
  { question: "What am I looking at?", answer: "This is an investor-facing visual concept for a possible Marcadele storefront. Navigation, search, saved pieces, and the presentation bag work locally in the browser; the experience is not connected to a live catalog." },
  { question: "Are the products, designers, and prices real?", answer: "No. Product names, product options, imagery, designer labels, and prices are illustrative presentation content. No designer relationship, authenticity claim, stock level, or sale offer is represented." },
  { question: "Can I place an order or make a payment?", answer: "No. The presentation bag cannot be checked out. It does not create an order, reserve inventory, or take payment." },
  { question: "Are shipping, returns, taxes, or customer support ready?", answer: "Those operating details have not been configured or approved for this concept. Do not rely on this preview for a delivery, returns, tax, or support commitment." },
  { question: "Where is Marcadele based?", answer: "The brand location provided for this work is Oregon, USA. No city, street address, or fulfillment origin is stated here." },
];

export default function FaqPage() {
  return (
    <main className="faq-page page-container">
      <section className="faq-intro"><p className="eyebrow">The details behind the preview</p><h1 className="display-title">A few helpful<br /><em>notes.</em></h1><p className="lead-copy">This page makes the boundaries of the visual presentation clear.</p><p className="collection-intro__note">{PREVIEW_NOTICE}</p></section>
      <div className="faq-list">{questions.map((item, index) => <details className="faq-item" key={item.question}><summary><span className="faq-item__number">0{index + 1}</span><span>{item.question}</span><span aria-hidden="true" className="faq-item__plus">+</span></summary><p>{item.answer}</p></details>)}</div>
      <div className="faq-footer"><p className="eyebrow">Still exploring?</p><Link className="text-link" href="/about">Learn about the concept <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/contact">Contact notes <span aria-hidden="true">↗</span></Link></div>
    </main>
  );
}
