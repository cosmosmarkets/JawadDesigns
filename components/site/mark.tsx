import Link from "next/link";

/* Studio wordmark — links home from the nav and the footer. */
export function Mark() {
  return (
    <Link href="/" className="k3-mark" aria-label="Jawad Design — home">
      <span className="k3-mark__badge" aria-hidden="true">JD</span>
      <span className="k3-mark__txt">
        <span className="k3-mark__name headline">Jawad Design</span>
        <span className="k3-mark__sub">Web studio · est. 2024</span>
      </span>
    </Link>
  );
}
