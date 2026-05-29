import Link from "next/link";

export function Placeholder({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) {
  return (
    <main className="sec jd-placeholder">
      <div className="wrap jd-placeholder__inner">
        <span className="kicker">{kicker}</span>
        <h1 className="headline jd-placeholder__title">{title}</h1>
        <p className="jd-placeholder__copy">{copy}</p>
        <Link href="/" className="btn ghost">
          Back to the kitchen <span className="arrow">→</span>
        </Link>
      </div>
    </main>
  );
}
