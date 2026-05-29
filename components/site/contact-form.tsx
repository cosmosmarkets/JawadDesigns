"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TIERS } from "./menu-full";

/* Real /contact page — the replacement for the old order modal. Dish chips mirror
   the menu tiers so a /contact?dish=… deep-link from a tier CTA preselects.
   On submit we open a pre-filled mailto, exactly as the modal did.
   TODO: backend (Resend route) is out of scope for this pass. */

const DISHES = TIERS.map((t) => t.name);

const schema = z.object({
  email: z.string().min(1, "Leave an email so I can reply").email("That doesn't look like an email"),
  message: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const params = useSearchParams();
  const initialDish = params.get("dish");
  const [dish, setDish] = useState(initialDish && DISHES.includes(initialDish) ? initialDish : "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    const subj = encodeURIComponent("New order — " + (dish || "a website"));
    const body = encodeURIComponent(
      "Hi Jawad,\n\nI'd like to place an order" +
        (dish ? " for: " + dish : "") +
        ".\n\nMy email: " +
        values.email +
        "\n\nWhat I'm launching:\n" +
        (values.message ?? "")
    );
    window.location.href = "mailto:hi@jawad.design?subject=" + subj + "&body=" + body;
  };

  return (
    <section className="sec ink jd-contact" data-screen-label="contact">
      <div className="wrap jd-contact__inner">
        <header className="jd-contact__head reveal">
          <span className="kicker">Contact</span>
          <h1 className="headline jd-contact__h">Place your order<span style={{ color: "var(--ember)" }}>.</span></h1>
          <p className="jd-contact__sub">Pick a course (optional), leave your email, and tell me what you&apos;re launching. I reply within 24 hours with a plan and a price — one human, no spam.</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="jd-contact__card" noValidate>
          <fieldset className="jd-contact__field">
            <legend className="eyebrow-mono jd-contact__label">Choose a course</legend>
            <div className="k3-order__chips" role="group" aria-label="Choose a course">
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

          <button type="submit" className="btn red lg jd-contact__submit" disabled={isSubmitting}>
            Continue <span className="arrow">→</span>
          </button>
          <span className="k3-order__fine eyebrow-mono">Opens your email · no spam, one human reply</span>
        </form>
      </div>
    </section>
  );
}
