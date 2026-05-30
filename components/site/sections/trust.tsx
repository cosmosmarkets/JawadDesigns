/* Trust band — marquee + three claims. Ported verbatim from the home. */
export function Trust() {
  const claims = [
    { h: "Designed & built", h2: "by the same hands.", p: "Strategy, design, and development from one person — no agency overhead, no handoffs, nothing lost in translation." },
    { h: "Live in a week,", h2: "not a quarter.", p: "A finished, deployed site in a single working week — and you watch it come together day by day." },
    { h: "Two things,", h2: "done exceptionally.", p: "Portfolio sites and landing pages — that's the whole menu. No dashboards, no MVPs, no scope creep." },
  ];
  const mq = ["JAWAD DESIGN", "✦", "MADE TO ORDER", "✦", "FIVE DAYS TO LIVE", "✦", "ONE CHEF, ONE TICKET", "✦"];
  const track = [...mq, ...mq];
  return (
    <section id="trust" className="sec cream k2-trust" data-screen-label="trust">
      <span className="k2-trust__numeral" aria-hidden="true">03</span>
      <div className="k3-paper k3-paper--ticket" aria-hidden="true">
        <div className="k3-ticket__hd">
          <span>TABLE 01</span>
          <span>GUEST CHECK</span>
        </div>
        <div className="k3-ticket__rule" />
        <div className="k3-ticket__big">Party of one</div>
        <div className="k3-ticket__sm">Served daily</div>
      </div>
      <div className="k2-trust__mq mq" aria-hidden="true">
        <div className="mq__t">{track.map((t, i) => <span key={i} className="display k2-trust__mqitem">{t}</span>)}</div>
      </div>
      <div className="wrap k2-trust__grid">
        {claims.map((c, i) => (
          <article key={i} className={"k2-claim reveal d" + i}>
            <span className="k3-drawline reveal k2-claim__line" />
            <h3 className="headline k2-claim__h reveal-lines">
              {c.h}
              <br />
              <span className="k2-claim__h2">{c.h2}</span>
            </h3>
            <p className="k2-claim__p">{c.p}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
