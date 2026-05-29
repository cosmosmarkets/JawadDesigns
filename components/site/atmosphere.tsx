/* Stage 1 cinematic atmosphere: vignette + warm candlelight pool + film grain.
   Fixed, non-interactive, above section content but below nav/modal. Pure CSS
   (styles/k3-pass4-material.css); the warm pool's vertical position (--jd-spot-y)
   is drifted on scroll by SmoothScrollProvider, and holds static under reduced
   motion. */
export function Atmosphere() {
  return (
    <div id="jd-atmos" aria-hidden="true">
      <div className="jd-atmos__vign" />
      <div className="jd-atmos__spot" />
      <div className="jd-atmos__grain" />
    </div>
  );
}
