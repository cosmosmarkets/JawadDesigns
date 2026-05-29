import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact — Jawad Design",
  description:
    "Place your order. Leave your email and what you're launching — one chef replies within 24 hours with a plan and a price.",
};

export default function ContactPage() {
  // ContactForm reads ?dish via useSearchParams, so it must sit under Suspense
  // to avoid Next's client-side-rendering bailout at build.
  return (
    <Suspense>
      <ContactForm />
    </Suspense>
  );
}
