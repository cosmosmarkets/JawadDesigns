"use client";

/* ============================================================================
   HeroShader — Stage 2 · raw WebGL2 heat-shimmer behind the plate (no three.js)
   ----------------------------------------------------------------------------
   A transparent full-rect fragment shader, screen-blended over the dark hero —
   warm candle-heat pooling on the charger.

   Performance + lifecycle discipline (the WebGL acceptance gate):
     • The GL context + program are compiled ONCE and cached on a ref. React
       StrictMode (and Fast Refresh) double-invoke the effect; rebuilding the
       program on the reused canvas context made the second pass fail to compile
       (empty info log). We now reuse the cached program on remount and only
       re-arm the rAF loop + ScrollTrigger — never recompile, never lose context.
     • The rAF loop only runs while the hero is on screen (ScrollTrigger
       onToggle) and the tab is visible (visibilitychange) — it never drains
       frames from the Stage 3 scrub / Stage 5 ticket once scrolled past.
     • Under prefers-reduced-motion or on mobile (≤720px) the loop NEVER starts:
       a single settled frame is drawn, then nothing. (If WebGL2 is missing the
       canvas stays transparent and the CSS spotlight carries the hero.)
   ========================================================================== */

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { VERT, FRAG } from "@/lib/gl/heat-shimmer.glsl";

type GLState = {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  uTime: WebGLUniformLocation | null;
  uRes: WebGLUniformLocation | null;
};

export function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GLState | null>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Build the program once; reuse the cached one on StrictMode remount ──
    const build = (): GLState | null => {
      const cached = stateRef.current;
      if (cached && !cached.gl.isContextLost()) return cached;

      const gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
      });
      if (!gl) return null; // no WebGL2 → CSS spotlight fallback

      const compile = (type: number, src: string) => {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          console.error(
            "[HeroShader]",
            type === gl.VERTEX_SHADER ? "VERT" : "FRAG",
            "lost=" + gl.isContextLost(),
            gl.getShaderInfoLog(sh) || "(no log)",
          );
          gl.deleteShader(sh);
          return null;
        }
        return sh;
      };

      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return null;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      // shaders are linked into the program now; the objects can go
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("[HeroShader] link:", gl.getProgramInfoLog(prog) || "(no log)");
        return null;
      }
      const s: GLState = {
        gl,
        prog,
        uTime: gl.getUniformLocation(prog, "u_time"),
        uRes: gl.getUniformLocation(prog, "u_res"),
      };
      stateRef.current = s;
      return s;
    };

    const state = build();
    if (!state) return;
    const { gl, prog, uTime, uRes } = state;

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, Math.round(canvas.clientWidth * d));
      const ch = Math.max(1, Math.round(canvas.clientHeight * d));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (tMs: number) => {
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform1f(uTime, tMs / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Dev-only frame counter so verification can confirm the loop pauses
    // off-screen and never starts under reduced motion / mobile.
    const dev = process.env.NODE_ENV !== "production";

    let raf = 0;
    let running = false;
    const loop = (now: number) => {
      draw(now);
      if (dev) {
        const w = window as unknown as { __heroFrames?: number };
        w.__heroFrames = (w.__heroFrames ?? 0) + 1;
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      stateRef.current = null; // force a rebuild if the context is restored
    };
    canvas.addEventListener("webglcontextlost", onLost);

    // Reduced motion / mobile: one settled frame, never loop. Drawn at a more
    // developed plume time (~7s) than the near-static t≈0 so the static haze has
    // real structure pooling on the plate — the calm CSS candle-breath does the
    // rest of the "material lives" work without any rAF under reduced motion.
    if (prefersReducedMotion() || window.matchMedia("(max-width: 720px)").matches) {
      requestAnimationFrame(() => draw(7000));
      return () => {
        canvas.removeEventListener("webglcontextlost", onLost);
      };
    }

    // Animated: run only while on screen and the tab is visible. onToggle drives
    // the start/stop on scroll crossings; the INITIAL arm uses a direct viewport
    // check (ScrollTrigger.isActive can still be false before its first refresh
    // under Lenis, which would leave the loop never started at load).
    const onScreenNow = () => {
      const r = canvas.getBoundingClientRect();
      return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
    };
    const st = ScrollTrigger.create({
      trigger: canvas,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? start() : stop()),
    });
    const onVis = () => {
      if (document.hidden) stop();
      else if (onScreenNow()) start();
    };
    document.addEventListener("visibilitychange", onVis);
    // Draw one frame immediately so the canvas is sized/painted, then arm the
    // loop if the hero is in view at load.
    requestAnimationFrame(() => {
      if (onScreenNow()) start();
      else draw(0);
    });

    return () => {
      stop();
      st.kill();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, []);

  return <canvas ref={canvasRef} className="k3-hero__shader" aria-hidden="true" />;
}
