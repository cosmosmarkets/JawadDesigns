import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Pause Lenis (or body overflow) while the mobile nav drawer is open. */
export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  } else {
    document.body.style.overflow = locked ? "hidden" : "";
  }
  document.documentElement.classList.toggle("jd-nav-open", locked);
}
