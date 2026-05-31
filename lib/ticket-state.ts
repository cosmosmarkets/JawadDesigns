/* ============================================================================
   lib/ticket-state.ts — Stage 5 cross-route printing-ticket state model
   ----------------------------------------------------------------------------
   Single source of truth for the ticket's slots + sessionStorage persistence,
   so the TicketProvider and the contact form's CONFIRMED seam can never drift.
   Pure, SSR-safe functions — no DOM beyond the guarded sessionStorage reads.

   The funnel ticket inks one line per touchpoint, ORDER-FREE: deep-linking
   /menu first inks THE MENU even if SEATED was never inked. State restores
   instantly on return/refresh (already-inked lines render at rest, no replay).
   ========================================================================== */

export type SlotId = "SEATED" | "SIGNATURE" | "RECIPE" | "MENU" | "CONFIRMED";

export interface TicketSlot {
  id: SlotId;
  label: string; // the printed line
  sub: string; // the faint sub-line under it
}

/* Funnel order, all pre-printed faint. RECIPE (/about) is optional in the
   journey but always printed so the ticket reads as a full guest check.
   CONFIRMED is the terminal climax (stamp + tear-off), so it is NOT part of the
   browse-progress denominator — the mobile pill counts the four BROWSE_SLOTS. */
export const SLOTS: TicketSlot[] = [
  { id: "SEATED", label: "Seated", sub: "Table for one" },
  { id: "SIGNATURE", label: "Signature", sub: "The flagship" },
  { id: "RECIPE", label: "The recipe", sub: "Met the chef" },
  { id: "MENU", label: "The menu", sub: "Prices read" },
  { id: "CONFIRMED", label: "Confirmed", sub: "Order placed" },
];

export const BROWSE_SLOTS: SlotId[] = ["SEATED", "SIGNATURE", "RECIPE", "MENU"];

/* The single trigger Stage 5's CONFIRMED ticket hooks into — dispatched ONLY
   from the contact form's resolved backend success (Stage 4.8), never the raw
   click. Detail carries the dish for context; NO PII (the email is captured
   server-side via Resend, never re-broadcast to same-origin listeners). */
export const ORDER_CONFIRMED_EVENT = "jd:order-confirmed";
export type OrderConfirmedDetail = { dish: string };

const KEY = "jd:ticket:v1";

/** Inked slots restored from this session. Never throws (private mode / quota /
    malformed value all collapse to an empty set). */
export function readInked(): Set<SlotId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as unknown;
    if (!Array.isArray(ids)) return new Set();
    const valid = new Set<string>(SLOTS.map((s) => s.id));
    return new Set(
      ids.filter((x): x is SlotId => typeof x === "string" && valid.has(x)),
    );
  } catch {
    return new Set();
  }
}

/** Persist the inked set for instant, replay-free restore on the next route /
    refresh. Best-effort — a write failure (private mode) just means the ticket
    won't persist, which is non-fatal. */
export function writeInked(inked: Set<SlotId>): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(Array.from(inked)));
  } catch {
    /* ignore — non-persistent ticket is acceptable */
  }
}
