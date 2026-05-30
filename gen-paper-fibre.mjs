// Generate the one shared paper-fibre texture tile (showstopper decision #5):
// a SEAMLESS, tileable, on-palette WebP overlaid at multiply ~8% on the menu
// booklet + thermal ticket. Procedural tileable value-noise → raw RGB → sharp →
// WebP, size-guarded ≤40KB. Deterministic; no external image API.
//   node gen-paper-fibre.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SIZE = 512;
const OUT_DIR = "public/assets/showstopper";
const OUT = `${OUT_DIR}/paper-fibre.webp`;
mkdirSync(OUT_DIR, { recursive: true });

const fade = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;
function hash(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
// tileable value noise: lattice wraps modulo cellsX/cellsY → seamless across edges
function vnoise(x, y, cellsX, cellsY) {
  const gx = (x * cellsX) / SIZE, gy = (y * cellsY) / SIZE;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const fx = fade(gx - x0), fy = fade(gy - y0);
  const X0 = ((x0 % cellsX) + cellsX) % cellsX, X1 = (X0 + 1) % cellsX;
  const Y0 = ((y0 % cellsY) + cellsY) % cellsY, Y1 = (Y0 + 1) % cellsY;
  const n00 = hash(X0, Y0), n10 = hash(X1, Y0), n01 = hash(X0, Y1), n11 = hash(X1, Y1);
  return lerp(lerp(n00, n10, fx), lerp(n01, n11, fx), fy);
}

// warm paper base (on-palette, ~--bone cream); low contrast so multiply ~8% stays subtle
const BASE = [244, 236, 224];
const buf = Buffer.alloc(SIZE * SIZE * 3);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const grain = vnoise(x, y, 8, 8) * 0.5 + vnoise(x, y, 16, 16) * 0.3 + vnoise(x, y, 32, 32) * 0.2;
    const fibre = vnoise(x, y, 160, 20); // many cells in x, few in y → drawn-out paper fibres
    const lum = (grain - 0.5) * 20 + (fibre - 0.5) * 16; // ±~18, deliberately low contrast
    const i = (y * SIZE + x) * 3;
    buf[i] = clamp(BASE[0] + lum);
    buf[i + 1] = clamp(BASE[1] + lum * 0.96);
    buf[i + 2] = clamp(BASE[2] + lum * 0.88); // warm bias
  }
}

let quality = 80, info;
do {
  info = await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 3 } })
    .webp({ quality, effort: 6 })
    .toFile(OUT);
  if (info.size <= 40 * 1024) break;
  quality -= 8;
} while (quality >= 40);

const pass = info.size <= 40 * 1024;
console.log(`>>> wrote ${OUT}  ${SIZE}x${SIZE}  ${(info.size / 1024).toFixed(1)}KB  q${quality}  (≤40KB: ${pass ? "PASS" : "FAIL"})`);
process.exit(pass ? 0 : 1);
