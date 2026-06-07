/**
 * Kronuz light-theme generator.
 *
 *   node build-theme.mjs
 *
 * The DARK theme (themes/Kronuz-color-theme.json) is the original 0.0.6 theme,
 * kept verbatim as the source of truth. Reproducing it from a palette was not
 * worth the drift risk, so we don't: it is the input here, not an output.
 *
 * The LIGHT theme is derived from it mathematically, so it stays a faithful
 * negative of the dark one and never drifts: every color's lightness is
 * inverted while hue and saturation are preserved. Chromatic colors are capped
 * so they stay deep enough to read on the light background (instead of washing
 * out), which is what a naive desaturated light palette got wrong.
 *
 * Writes themes/Kronuz-light-color-theme.json.
 */
import { readFileSync, writeFileSync } from "node:fs";

const here = (p) => new URL(p, import.meta.url);

// "#rgb" / "#rgba" / "#rrggbb" / "#rrggbbaa" -> [r, g, b] in 0..1 + alpha suffix.
const parseHex = (hex) => {
  let m = hex.slice(1), a = "";
  if (m.length === 8) { a = m.slice(6); m = m.slice(0, 6); }
  else if (m.length === 4) { a = m[3] + m[3]; m = m.slice(0, 3); }
  if (m.length === 3) m = [...m].map((c) => c + c).join("");
  return [parseInt(m.slice(0, 2), 16) / 255, parseInt(m.slice(2, 4), 16) / 255, parseInt(m.slice(4, 6), 16) / 255, a];
};

const rgb2hsl = (r, g, b) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  let s = 0, h = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (mx) { case r: h = ((g - b) / d) % 6; break; case g: h = (b - r) / d + 2; break; default: h = (r - g) / d + 4; }
    h = (h * 60 + 360) % 360;
  }
  return [h, s * 100, l * 100];
};

const hsl = (h, s, l) => {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const to = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
};

// The light counterpart of a dark color, derived deterministically:
//  - Neutral surfaces (dark grays) brighten toward white so the editor reads as
//    a proper light surface; mid grays invert to light borders and the light
//    text/foregrounds invert to dark. (A flat lightness-inversion left the
//    editor a dim #c7c7c7, so deep neutrals get lifted instead.)
//  - Chromatic colors invert lightness (hue + saturation kept) but stay deep
//    enough to read richly on the light background instead of washing out.
const toLight = (hex) => {
  if (typeof hex !== "string" || hex[0] !== "#") return hex;
  const [r, g, b, a] = parseHex(hex);
  const [h, s, l] = rgb2hsl(r, g, b);
  if (s < 12) {
    // Neutral: deep surfaces brighten toward white; mid grays/text invert, but
    // the darkest text is floored so it lands around #2a2827, not near-black.
    const L = l < 28 ? 92 + l * 0.28 : Math.max(16, 100 - l);
    return hsl(h, s, L) + a;
  }
  // Chromatic: invert + deepen, and boost saturation so colors stay vivid on the
  // light background (a white surround makes equal-saturation colors look washed).
  // Greens/yellow-greens are more luminous, so cap them deeper for even weight;
  // a floor keeps already-pale accents (e.g. this/super) from crushing to black.
  const luminous = h >= 55 && h <= 175;
  const L = Math.max(28, Math.min(100 - l, luminous ? 32 : 40));
  const S = Math.min(92, s * 1.2 + 12);
  return hsl(h, S, L) + a;
};

const dark = JSON.parse(readFileSync(here("./themes/Kronuz-color-theme.json")));

const mapColors = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, toLight(v)]));

const light = {
  name: "Kronuz Light",
  type: "light",
  semanticHighlighting: true,
  colors: mapColors(dark.colors),
  tokenColors: (dark.tokenColors || []).map((t) => {
    const settings = { ...t.settings };
    if (settings.foreground) settings.foreground = toLight(settings.foreground);
    return "scope" in t ? { scope: t.scope, settings } : { settings };
  }),
};

writeFileSync(here("./themes/Kronuz-light-color-theme.json"), JSON.stringify(light, null, "\t") + "\n");
console.log("wrote themes/Kronuz-light-color-theme.json (mathematical light-inverse of the 0.0.6 dark theme)");
