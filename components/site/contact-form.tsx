"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, withMotion } from "@/lib/motion";
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
  const scope = useRef<HTMLElement>(null);
  const [dish, setDish] = useState("");

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
    <section ref={scope} className="sec ink jd-contact" data-screen-label="contact">
      <div className="wrap jd-contact__inner">
        <header className="jd-contact__head reveal">
          <span className="kicker">Contact</span>
          <h1 className="headline jd-contact__h reveal-lines reveal-lines--local">Place your order<span style={{ color: "var(--ember)" }}>.</span></h1>
          <p className="jd-contact__sub">Pick a course (optional), leave your email, and tell me what you&apos;re launching. I reply within 24 hours with a plan and a price — one human, no spam.</p>
        </header>

        <div className="k3-hairline" aria-hidden />

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
