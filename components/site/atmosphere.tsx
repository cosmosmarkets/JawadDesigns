/* Stage 1 cinematic atmosphere: vignette + warm candlelight pool + film grain.
   Fixed, non-interactive, above section content but below nav/modal. The static
   layer only — the scroll-tracked spotlight drift returns with the motion stack
   in Stage 0. Pure CSS (styles/k3-pass4-material.css), so no client JS. */
export function Atmosphere() {
  return (
    <div id="jd-atmos" aria-hidden="true">
      <div className="jd-atmos__vign" />
      <div className="jd-atmos__spot" />
      <div className="jd-atmos__grain" />
    </div>
  );
}
