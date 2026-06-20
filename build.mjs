/**
 * Kronuz theme — single source of truth, three editors.
 *
 *   node build.mjs
 *
 * The canonical theme is the original 0.0.6 dark theme (src/base-dark.json, the
 * verbatim VS Code tokenColors + workbench colors) MERGED with a small set of modern,
 * normalized TextMate scopes that the original predates (decorators, object-literal
 * keys, namespaces, ...). From that one canonical definition this emits, identically:
 *
 *   - VS Code   themes/Kronuz-color-theme.json        (dark)  + Kronuz-light-color-theme.json
 *   - Sublime   ../Kronuz-Theme/Kronuz.sublime-color-scheme  + Kronuz-Light.sublime-color-scheme
 *   - TextMate  ../kronuzsh/integrations/themes/Kronuz.tmTheme + Kronuz-Light.tmTheme
 *               (used by bat, git-delta and yazi's syntect code preview)
 *
 * Every LIGHT variant is derived mathematically from its dark counterpart (lightness
 * inverted, hue/saturation kept, chromatics deepened so they read on a light page), so
 * the two never drift. Off-palette colors from the original (the 12 odd ones: token.*
 * debug colors, a few language one-offs) are kept verbatim by request.
 *
 * Sibling repos (../Kronuz-Theme, ../kronuzsh) are written only when present.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const here = (p) => new URL(p, import.meta.url);
const root = (p) => new URL(p, import.meta.url).pathname;

/* ----------------------------------------------------------------- light derivation */
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
const toLight = (hex) => {
  if (typeof hex !== "string" || hex[0] !== "#") return hex;
  const [r, g, b, a] = parseHex(hex);
  const [h, s, l] = rgb2hsl(r, g, b);
  if (s < 12) return hsl(h, s, l < 28 ? 92 + l * 0.28 : Math.max(16, 100 - l)) + a;
  const luminous = h >= 55 && h <= 175;
  const L = Math.max(28, Math.min(100 - l, luminous ? 32 : 40));
  const S = Math.min(92, s * 1.2 + 12);
  return hsl(h, S, L) + a;
};

/* ------------------------------------------------------------------ canonical theme */
// The clean named palette (the classic 0.0.6 Kronuz colors). Used for the Sublime
// variables block and to give the off-palette report something to compare against.
const palette = {
  background: "#383838", foreground: "#c8c6c5", dim: "#7a7775", soft: "#9a9794", caret: "#c07020",
  comment: "#95815e", string: "#a5c261", number: "#a5c260", regexp: "#c7d87b", escape: "#d08442",
  keyword: "#cc7833", func: "#e8bf6a", type: "#da4939", cls: "#ffd68d", tag: "#caa473",
  vari: "#e8e6e5", param: "#fde9bbdd", lang: "#d0d0ff", constLang: "#6e9cbe", raw: "#d687bf", link: "#6089b4",
  heading: "#fd971f", mdBold: "#437cb9", mdItalic: "#7ea4cc", list: "#9aa83a",
  ins: "#219186", del: "#dc322f", chg: "#cb4b16", invalid: "#ff0b00",
};

// Modern, normalized scopes the verbatim 0.0.6 theme predates. Appended to the base so
// all three editors style decorators, object-literal keys, namespaces, etc. These only
// cover scopes the base leaves unstyled — they never override the original's look.
const additions = [
  { scope: "punctuation.definition.comment", settings: { foreground: palette.comment, fontStyle: "italic" } },
  { scope: "meta.string", settings: { foreground: palette.string } },
  { scope: "constant.other.placeholder", settings: { foreground: palette.escape } },
  { scope: "constant.other, punctuation.accessor", settings: { foreground: palette.keyword } },
  { scope: "entity.name.namespace", settings: { foreground: palette.type } },
  { scope: "punctuation.definition.tag", settings: { foreground: palette.tag } },
  { scope: "support.type.property-name, meta.object-literal.key, meta.definition.variable", settings: { foreground: palette.vari } },
  { scope: "meta.decorator, punctuation.decorator, entity.name.label", settings: { foreground: palette.func } },
  { scope: "punctuation, meta.brace, punctuation.separator, punctuation.terminator", settings: { foreground: palette.foreground } },
  { scope: "entity.name.section", settings: { foreground: palette.heading, fontStyle: "bold" } },
  { scope: "markup.link", settings: { foreground: palette.link, fontStyle: "underline" } },
  { scope: "markup.raw.inline, markup.raw, markup.fenced_code", settings: { foreground: palette.raw } },
];

const base = JSON.parse(readFileSync(here("./src/base-dark.json")));
// Canonical dark = the verbatim base + the modern-scope additions.
const darkTokens = [...base.tokenColors, ...additions];
const darkColors = base.colors;

// Map a tokenColors list to its light counterpart.
const lightTokens = (toks) => toks.map((t) => {
  const settings = { ...t.settings };
  if (settings.foreground) settings.foreground = toLight(settings.foreground);
  return "scope" in t ? { scope: t.scope, settings } : { settings };
});
const mapColors = (obj) => Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, toLight(v)]));

/* ---------------------------------------------------------------------- UI globals */
// Editor-chrome colors shared by Sublime + TextMate, derived from the workbench colors
// so the three editors frame the code the same way.
const ui = (c) => ({
  background: c["editor.background"],
  foreground: c["editor.foreground"],
  caret: c["editorCursor.foreground"],
  lineHighlight: c["editor.lineHighlightBackground"],
  selection: c["editor.selectionBackground"],
  inactiveSelection: c["editor.selectionHighlightBackground"],
  invisibles: c["editorWhitespace.foreground"],
  guide: c["editorIndentGuide.background"],
  activeGuide: c["editorIndentGuide.activeBackground"],
  gutterForeground: c["editorLineNumber.activeForeground"],
});

/* ------------------------------------------------------------------- VS Code output */
const vscode = (name, type, tokens, colors) => JSON.stringify(
  { name, type, semanticHighlighting: true, colors, tokenColors: tokens }, null, "\t") + "\n";

/* ------------------------------------------------------------------- Sublime output */
const hexToVar = Object.fromEntries(Object.entries(palette).map(([k, v]) => [v.toLowerCase(), k]));
const subColor = (hex, light) => {
  if (typeof hex !== "string" || hex[0] !== "#") return hex;
  const name = hexToVar[hex.toLowerCase()];
  return name ? `var(${name})` : (light ? toLight(hex) : hex);
};
const sublime = (light) => {
  const vars = light ? mapColors(palette) : palette;
  const g = ui(light ? mapColors(darkColors) : darkColors);
  const globals = {
    background: "var(background)", foreground: "var(foreground)",
    caret: "var(caret)", block_caret: "var(caret)",
    line_highlight: g.lineHighlight, selection: g.selection, selection_border: "var(background)",
    inactive_selection: g.inactiveSelection, misspelling: "var(del)",
    highlight: "var(link)", find_highlight: "var(keyword)", find_highlight_foreground: "var(background)",
    gutter: "var(background)", gutter_foreground: "var(dim)",
    guide: g.guide, active_guide: "var(caret)", stack_guide: g.activeGuide,
    brackets_foreground: "var(keyword)", brackets_options: "underline",
    bracket_contents_foreground: "var(keyword)", bracket_contents_options: "underline",
    tags_foreground: "var(tag)", tags_options: "stippled_underline",
    invisibles: g.invisibles, shadow: light ? "hsla(0, 0%, 0%, 0.12)" : "hsla(0, 0%, 0%, 0.25)",
  };
  const rules = darkTokens.filter((t) => "scope" in t && t.settings.foreground).map((t) => ({
    scope: t.scope,
    foreground: subColor(t.settings.foreground, light),
    ...(t.settings.fontStyle ? { font_style: t.settings.fontStyle } : {}),
  }));
  return JSON.stringify({
    name: light ? "Kronuz Light" : "Kronuz",
    author: "Germán Méndez Bravo (Kronuz)",
    variables: vars, globals, rules,
  }, null, "\t") + "\n";
};

/* ------------------------------------------------------------------ TextMate output */
const xmlEscape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// A TextMate entry: an optional scope plus a NESTED <settings> dict (the format bat and
// syntect require — foreground/fontStyle live inside settings, not at the top level).
const tmEntry = (scope, settings) => {
  let out = "\t\t<dict>\n";
  if (scope) out += `\t\t\t<key>scope</key>\n\t\t\t<string>${xmlEscape(scope)}</string>\n`;
  out += "\t\t\t<key>settings</key>\n\t\t\t<dict>\n";
  for (const [k, v] of Object.entries(settings)) {
    out += `\t\t\t\t<key>${k}</key>\n\t\t\t\t<string>${xmlEscape(v)}</string>\n`;
  }
  return out + "\t\t\t</dict>\n\t\t</dict>\n";
};
const tmTheme = (light) => {
  const L = (h) => (light ? toLight(h) : h);
  const g = ui(light ? mapColors(darkColors) : darkColors);
  let s = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  s += `<!-- Generated by kronuz-theme-vscode/build.mjs from the canonical Kronuz theme; do not edit by hand. -->\n`;
  s += `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n`;
  s += `<plist version="1.0">\n<dict>\n`;
  s += `\t<key>name</key>\n\t<string>${light ? "Kronuz Light" : "Kronuz"}</string>\n`;
  s += `\t<key>settings</key>\n\t<array>\n`;
  // global settings entry (no scope)
  s += tmEntry(null, {
    background: L(g.background), foreground: L(g.foreground), caret: L(g.caret),
    lineHighlight: L(g.lineHighlight), selection: L(g.selection), invisibles: L(g.invisibles),
  });
  // one entry per scoped rule that sets a foreground
  for (const t of darkTokens) {
    if (!("scope" in t) || !t.settings.foreground) continue;
    const scope = Array.isArray(t.scope) ? t.scope.join(", ") : t.scope;
    const settings = { foreground: L(t.settings.foreground) };
    if (t.settings.fontStyle) settings.fontStyle = t.settings.fontStyle;
    s += tmEntry(scope, settings);
  }
  s += `\t</array>\n</dict>\n</plist>\n`;
  return s;
};

/* ----------------------------------------------------------------------------- emit */
const write = (url, data, label) => {
  const p = typeof url === "string" ? url : url.pathname;
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, data);
  console.log(`  wrote ${label}`);
};
const sibling = (rel) => new URL(rel, import.meta.url);

console.log("kronuz-theme: generating from src/base-dark.json + modern-scope merge");

// VS Code (this repo)
write(here("./themes/Kronuz-color-theme.json"), vscode("Kronuz", "dark", darkTokens, darkColors), "vscode dark  themes/Kronuz-color-theme.json");
write(here("./themes/Kronuz-light-color-theme.json"), vscode("Kronuz Light", "light", lightTokens(darkTokens), mapColors(darkColors)), "vscode light themes/Kronuz-light-color-theme.json");

// Sublime (sibling repo)
if (existsSync(root("../Kronuz-Theme"))) {
  write(sibling("../Kronuz-Theme/Kronuz.sublime-color-scheme"), sublime(false), "sublime dark  ../Kronuz-Theme/Kronuz.sublime-color-scheme");
  write(sibling("../Kronuz-Theme/Kronuz-Light.sublime-color-scheme"), sublime(true), "sublime light ../Kronuz-Theme/Kronuz-Light.sublime-color-scheme");
} else console.log("  (skip Sublime — ../Kronuz-Theme not present)");

// TextMate (kronuzsh sibling repo)
if (existsSync(root("../kronuzsh"))) {
  write(sibling("../kronuzsh/integrations/themes/Kronuz.tmTheme"), tmTheme(false), "textmate dark  ../kronuzsh/integrations/themes/Kronuz.tmTheme");
  write(sibling("../kronuzsh/integrations/themes/Kronuz-Light.tmTheme"), tmTheme(true), "textmate light ../kronuzsh/integrations/themes/Kronuz-Light.tmTheme");
} else console.log("  (skip TextMate — ../kronuzsh not present)");

console.log("done.");
