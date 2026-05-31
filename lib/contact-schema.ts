import { z } from "zod";

/* Single source of truth for the /contact order shape. The client form
   (react-hook-form + zodResolver) and the server route handler both import
   this so validation can never drift between the two. The honeypot field is
   intentionally NOT part of this schema — it is a bot trap checked separately
   server-side, never surfaced to the human as a validation error. */
export const contactSchema = z.object({
  email: z
    .string()
    .min(1, "Leave an email so I can reply")
    .email("That doesn't look like an email"),
  message: z.string().max(4000, "That's a lot — trim it a touch").optional(),
  // dish mirrors a menu tier name; the chips constrain it client-side, the
  // server only caps length so an odd value can't bloat the email.
  dish: z.string().max(80).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/* The hidden bot-trap field name. A real human never fills it; a script that
   blindly fills inputs will. Kept here so client + server agree on the name. */
export const HONEYPOT_FIELD = "company";
