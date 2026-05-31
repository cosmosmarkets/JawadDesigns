"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, withMotion } from "@/lib/motion";
import { TIERS } from "./menu-full";
import { contactSchema, type ContactInput, HONEYPOT_FIELD } from "@/lib/contact-schema";

/* Real /contact page — the replacement for the old order modal. Dish chips mirror
   the menu tiers so a /contact?dish=… deep-link from a tier CTA preselects.

   Stage 4.8: submit POSTs to /api/contact (Resend) and resolves to an ON-PAGE
   success state — no mailto handoff. The validated success is the SINGLE source
   of truth the Stage 5 CONFIRMED ticket hooks into: on resolved success we fire
   a one-shot `jd:order-confirmed` window event and stamp `data-order-confirmed`
   on the ack node, so the (not-yet-built) TicketProvider inks CONFIRMED from a
   real order, never from the click. A 4xx/5xx shows an inline error and fires
   nothing. */

const DISHES = TIERS.map((t) => t.name);

// reuse the SHARED schema so client + server validation can never drift
const schema = contactSchema;
type FormValues = ContactInput;

/** Event the Stage 5 ticket listens on. Detail is the minimum the ticket needs
    — the dish for context; NO email (the address is captured server-side via
    Resend, never re-broadcast to same-origin listeners). */
export const ORDER_CONFIRMED_EVENT = "jd:order-confirmed";
export type OrderConfirmedDetail = { dish: string };

export function ContactForm() {
  const scope = useRef<HTMLElement>(null);
  const ackRef = useRef<HTMLHeadingElement>(null);
  const [dish, setDish] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // mirrors the rendered dish into the success ack so it survives a chip change
  const [orderedDish, setOrderedDish] = useState("");

  // Preselect the dish from a ?dish= deep-link in a post-mount effect rather than
  // useSearchParams(): the hook forces a CSR bailout that defers this client
  // component's hydration, which races the global SplitText split on the lead h1
  // (hydration mismatch + a lost masked wipe). Reading after mount keeps hydration
  // clean, so the reveal-lines wipe runs normally.
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("dish");
    if (d && DISHES.includes(d)) setDish(d);
  }, []);

  // Composed lead entrance. The heading's masked line-wipe is owned HERE (not by
  // the global batch) because this is a heavy client component that hydrates after
  // the layout-level batch runs — a global split would race hydration and fail
  // (the h1 carries `reveal-lines--local` so the global batch skips it). The h1
  // lines wipe up while the order card — the route's signature element and sole
  // owner of its transform — ascends and its fields stagger in behind it.
  // From-states are set at t=0 so nothing flashes before animating. Under reduced
  // motion the no-preference branch never runs and everything stays at visible rest.
  useGSAP(
    () => {
      return withMotion(() => {
        const root = scope.current!;
        const h1 = root.querySelector<HTMLElement>(".jd-contact__h");
        const card = root.querySelector<HTMLElement>(".jd-contact__card");
        const fields = card ? gsap.utils.toArray<HTMLElement>(".jd-contact__field", card) : [];

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        let split: SplitText | null = null;
        if (h1) {
          // Pin y:0 so yPercent is the sole driver (the CSS pre-paint hide bakes a
          // pixel y into GSAP's channel otherwise — same fix as the global batch).
          split = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: "line" });
          tl.set(split.lines, { yPercent: 110, y: 0 }, 0);
          tl.to(split.lines, { yPercent: 0, duration: 0.9, stagger: 0.12, ease: "power2.out" }, 0.1);
        }
        if (card) {
          tl.set(card, { opacity: 0, y: 28 }, 0);
          tl.set(fields, { opacity: 0, y: 16 }, 0);
          tl
            .to(card, { opacity: 1, y: 0, duration: 0.9 }, 0.2)
            .to(fields, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.45);
        }

        return () => split?.revert();
      });
    },
    { scope },
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // async → react-hook-form awaits it, so `isSubmitting` stays true for the POST
  // and the submit button is disabled for the round-trip.
  const onSubmit = async (values: FormValues) => {
    if (isSubmitting || submitted) return; // belt-and-braces against a double-Enter
    setSubmitError(null);
    const honey = (scope.current?.querySelector<HTMLInputElement>(`input[name="${HONEYPOT_FIELD}"]`)?.value) ?? "";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, dish, [HONEYPOT_FIELD]: honey }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setSubmitError(data?.error || "Couldn't send your order. Try again, or email hi@jawad.design.");
        return; // failure: NO success state, NO CONFIRMED event
      }
      setOrderedDish(dish);
      setSubmitted(true);
      // The single trigger Stage 5's CONFIRMED ticket hooks into — fired ONLY
      // from a resolved backend success, never from the click.
      window.dispatchEvent(
        new CustomEvent<OrderConfirmedDetail>(ORDER_CONFIRMED_EVENT, { detail: { dish } }),
      );
    } catch {
      setSubmitError("Network hiccup — your order didn't send. Try again, or email hi@jawad.design.");
    }
  };

  // Move focus to the ack HEADING on success — focusing a named <h2> announces
  // it to SR cleanly; the panel is NOT a live region (one announcement, not a
  // focus-vs-aria-live race). Entrance staggers the children so the focus target
  // never sits on a transparent container. Reduced motion = no tween, just render.
  useEffect(() => {
    if (!submitted) return;
    ackRef.current?.focus();
    withMotion(() => {
      const ack = scope.current?.querySelector(".jd-contact__ack");
      if (ack) gsap.from(ack.children, { opacity: 0, y: 14, duration: 0.55, stagger: 0.08, ease: "power3.out" });
    });
  }, [submitted]);

  return (
    <section ref={scope} className="sec ink jd-contact" data-screen-label="contact">
      <div className="wrap jd-contact__inner">
        <header className="jd-contact__head reveal">
          <span className="kicker">Contact</span>
          <h1 className="headline jd-contact__h reveal-lines reveal-lines--local">Place your order<span style={{ color: "var(--ember)" }}>.</span></h1>
          <p className="jd-contact__sub">Pick a course (optional), leave your email, and tell me what you&apos;re launching. I reply within 24 hours with a plan and a price — one human, no spam.</p>
        </header>

        <div className="k3-hairline" aria-hidden />

        {submitted ? (
          <div
            data-order-confirmed
            data-ordered-dish={orderedDish || undefined}
            className="jd-contact__card jd-contact__ack"
          >
            <span className="eyebrow-mono jd-contact__ack-tag">Order received</span>
            <h2 ref={ackRef} tabIndex={-1} className="headline jd-contact__ack-h">
              Table booked<span style={{ color: "var(--ember)" }}>.</span>
            </h2>
            <p className="jd-contact__ack-body">
              {orderedDish ? (
                <>Your <strong>{orderedDish}</strong> is in. </>
              ) : (
                <>Your order is in. </>
              )}
              I&apos;ll reply within 24 hours with a plan and a price — one human, no spam.
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="jd-contact__card" noValidate>
          <fieldset className="jd-contact__field">
            <legend className="eyebrow-mono jd-contact__label">Choose a course</legend>
            <div className="k3-order__chips">
              {DISHES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={"k3-order__chip" + (dish === d ? " on" : "")}
                  onClick={() => setDish(dish === d ? "" : d)}
                  aria-pressed={dish === d}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="jd-contact__field">
            <label htmlFor="email" className="eyebrow-mono jd-contact__label">Your email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.com"
              className="k3-order__input"
              aria-invalid={errors.email ? "true" : undefined}
              {...register("email")}
            />
            {errors.email && <span className="jd-contact__error" role="alert">{errors.email.message}</span>}
          </div>

          <div className="jd-contact__field">
            <label htmlFor="message" className="eyebrow-mono jd-contact__label">What you&apos;re launching <span className="jd-contact__opt">(optional)</span></label>
            <textarea
              id="message"
              rows={4}
              placeholder="A portfolio for my studio, a landing page for a launch…"
              className="k3-order__input jd-contact__textarea"
              {...register("message")}
            />
          </div>

          {/* Honeypot: visually hidden, off the tab order, ignored by humans.
              A bot that auto-fills inputs trips it → server drops silently. */}
          <div aria-hidden="true" className="jd-contact__hp">
            <label htmlFor={HONEYPOT_FIELD}>Company</label>
            <input
              id={HONEYPOT_FIELD}
              name={HONEYPOT_FIELD}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button type="submit" className="btn red lg jd-contact__submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "Sending…" : "Place order"} <span className="arrow">→</span>
          </button>
          {submitError && (
            <span className="jd-contact__error" role="alert">{submitError}</span>
          )}
          <span className="k3-order__fine eyebrow-mono">Sent straight to the chef · no spam, one human reply</span>
        </form>
        )}
      </div>
    </section>
  );
}
