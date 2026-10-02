"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <div className="newsletter-form-wrap">
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="preview-newsletter-email">Email address</label>
        <input autoComplete="email" id="preview-newsletter-email" name="email" placeholder="Your email address" required type="email" />
        <button aria-label="Join the preview list" type="submit"><ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} /></button>
      </form>
      <p aria-live="polite" className="newsletter-form__note">
        {submitted ? "Thank you — the sign-up shown here is not connected or saved." : "Preview interaction only. This form does not transmit or store your email."}
      </p>
    </div>
  );
}
