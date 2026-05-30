/* ============================================================================
   heat-shimmer.glsl.ts — Stage 2 hero accent (raw WebGL2, no three.js)
   ----------------------------------------------------------------------------
   A single full-rect fragment shader: warm candle-heat haze rising from the
   plate, with a faint film grain. Rendered to a transparent canvas and
   screen-blended over the dark hero ground (see hero-shader.tsx + CSS).

   Cheap by design: one fullscreen triangle (no vertex buffers — positions come
   from gl_VertexID), 4-octave fbm, no textures. Kept well inside the FPS/JS
   budget; the loop is paused off-screen and never starts under reduced motion
   or on mobile.
   ========================================================================== */

// Fullscreen triangle from gl_VertexID — no attribute buffers needed.
export const VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

out vec4 fragColor;

uniform float u_time;
uniform vec2  u_res;

// --- value noise + fbm -----------------------------------------------------
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  // preserve aspect so the haze cells aren't stretched
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;

  float t = u_time * 0.05;

  // rising, domain-warped haze — plumes drift upward over time
  vec2 q = vec2(fbm(p * 3.0 + vec2(0.0, -t * 2.0)),
                fbm(p * 3.0 + vec2(5.2, -t * 1.3)));
  float haze = fbm(p * 4.0 + q * 1.5 + vec2(0.0, -t * 3.0));
  haze = smoothstep(0.35, 0.95, haze);

  // concentrate the heat near the plate (bottom-centre), fade out toward edges
  float cx = 1.0 - smoothstep(0.0, 0.42, abs(uv.x - 0.5));
  float cy = smoothstep(0.05, 0.62, uv.y) * (1.0 - smoothstep(0.55, 1.0, uv.y));
  float mask = cx * cy;

  // faint film grain
  float grain = (hash(gl_FragCoord.xy + fract(u_time) * 311.7) - 0.5) * 0.06;

  float intensity = haze * mask;
  // warm candlelight: amber → ember
  vec3 warm = mix(vec3(0.92, 0.55, 0.28), vec3(0.85, 0.27, 0.16), haze);
  vec3 col = warm * intensity + grain;

  fragColor = vec4(col, clamp(intensity * 0.9 + abs(grain), 0.0, 1.0));
}`;
