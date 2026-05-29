# Showstopper Asset Inventory

Source art for the Jawad Design showstopper overhaul (Stages 0–7 in `jawad-design-showstopper-plan.md`).
Produced during Pre-flight so no stage stalls waiting on art.

**Material:** all assets are hand-authored **SVG** — vector emblems + procedural `feTurbulence` textures.
Rationale: kilobytes not megabytes (the perf budget caps added weight), infinitely scalable, GPU-cheap,
recolourable, and directly importable as React components (`image-to-code-skill`) when a stage needs one.

**Palette (matches `app/styles/k3-tokens.css` exactly — do not invent new brand colors):**
`--char #161210` · `--ember #D2462F` · `--ember-deep #9e2f1f` · `--brass #C9A24B` · `--gold #EAD18A` · `--bone #F4E7D6`

| File | Role | Stage | Size (px) | Tileable | How to consume |
|---|---|---|---|---|---|
| `film-grain.svg` | Page-wide grain overlay | 1 | 320×320 | ✓ | Fixed full-bleed layer, `opacity: .03–.05`, `mix-blend-mode: overlay`. Animate `seed`/translate for live grain. |
| `vignette.svg` | Film-noir edge darkening | 1 | 1280×900 | — | Fixed full-bleed, above content / below grain. Transparent core preserves body-copy contrast. |
| `spotlight-pool.svg` | Warm candlelit light pool | 1, 2 | 1280×960 | — | Behind hero plate + per-section spotlight. Composite `screen`/`lighten`; drive `cx/cy` by scroll/cursor. |
| `plate-charger.svg` | Empty charger, top-down | 2 | 560×560 | — | Hero centerpiece under the spotlight; ember rim-light upper-left. Headline "plates" onto it. |
| `steam-wisp.svg` | Rising steam ribbons | 2 | 240×320 | — | Above the plate, `screen` blend. Animate translateY+opacity for the curl. Hidden under reduced-motion. |
| `garnish-flourish.svg` | Calligraphic brass swash | 2, 3 | 480×120 | — | Sweeps in after the headline; also a divider accent. `pathLength="100"` → draw via `stroke-dashoffset`. |
| `paper-card-texture.svg` | Printed-stock surface | 4 | 600×600 | ✓ | `background-image` for the fold-out menu card. Letterpress shadows sit on top. |
| `deckled-edge.svg` | Feathered torn paper edge | 4 | 200×24 | ✓ (x) | `mask-image` / border-slice on the menu card edge so it reads as stock, not a div. |
| `brass-crest.svg` | Embossed JD monogram crest | 4 | 280×280 | — | Menu card cover + footer mark. Monogram is live `<text>` (Bodoni); outline it if shipping w/o the font. |
| `thermal-paper-texture.svg` | Receipt stock | 5 | 360×360 | ✓ (y) | `background-image` for the order ticket. Curl-shadow stays a separate CSS layer. |
| `perforation-edge.svg` | Torn + perforated top edge | 5 | 48×20 | ✓ (x) | `background-repeat: repeat-x` on the ticket top; recolour fills to the thermal stock. |

## Notes
- **Recoloring:** textures carry literal hexes (SVG filters can't read CSS vars). If a token shifts in
  Stage 1, update the matching hex in the affected file — they're commented at the top of each.
- **Reduced motion:** every asset is static by default. Motion (grain seed, spotlight tracking, steam,
  flourish draw) is added by the consuming component and must be gated behind `prefers-reduced-motion`.
- **Accessibility:** emblem SVGs carry `role="img"` + `aria-label`; purely decorative ones (`steam-wisp`,
  `perforation-edge`, `deckled-edge`) are `aria-hidden`/ornamental — keep them out of the a11y tree.
- **Not generated here (raster/3D):** none required. If a stage later wants a photographic plate or true
  3D fold, regenerate via `imagegen-frontend-web` then `image-to-code-skill`; until then these vectors hold.
