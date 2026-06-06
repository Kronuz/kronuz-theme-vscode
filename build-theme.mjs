/**
 * Build the Kronuz VS Code themes (dark + light) from one palette + scope map.
 *
 *   node build-theme.mjs
 *
 * The original theme mixed the clean Kronuz palette with leftover ad-hoc hex
 * from an older base, was dark-only, and left gaps in the workbench colors.
 * This rebuilds both a dark and a light variant coherently: neutral gray UI
 * surfaces (warmth lives in the text/accents, as in the editor), the Kronuz
 * "-ish" palette (red/orange/yellow/green/blue/purple/pink) for syntax, and a
 * deliberate scope -> color map shared by both variants.
 *
 * Writes themes/Kronuz-color-theme.json and themes/Kronuz-light-color-theme.json.
 */
import { writeFileSync } from "node:fs";

const hsl = (h, s, l) => {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const to = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
};
const HUE = { red: 0, orange: 24, yellow: 40, green: 154, blue: 210, purple: 267, pink: 330 };
const ramp = (s, l) => Object.fromEntries(Object.entries(HUE).map(([k, h]) => [k, hsl(h, s, l)]));

function build(variant) {
  const dark = variant === "dark";
  // Syntax palette: bright on dark, a touch deeper on light for contrast.
  const c = dark ? ramp(58, 64) : ramp(62, 42);
  // Neutral UI grays (warmth only in fg/accents, like the real Kronuz editor).
  const g = dark
    ? { bg: hsl(28, 9, 18), bg0: hsl(28, 9, 10), bg1: hsl(28, 9, 13), bg2: hsl(28, 8, 15), bg3: hsl(28, 8, 16),
        line: "#ffffff0a", border: hsl(28, 6, 30), dim: "#7a7775", fg: "#c8c6c5", fgSoft: "#9a9794" }
    : { bg: "#faf8f5", bg0: "#ece9e4", bg1: "#f1efea", bg2: "#e9e6e1", bg3: "#f4f2ee",
        line: "#00000008", border: "#dcd8d2", dim: "#9a9690", fg: "#403a36", fgSoft: "#6a655f" };
  const cursor = dark ? "#d08040" : "#b3611f"; // warm caret, the Kronuz signature
  const sel = dark ? "#3366ff55" : "#3366ff22";
  const a = (hex, alpha) => hex + alpha; // append alpha to a 6-digit hex

  const colors = {
    "focusBorder": c.orange + "80",
    "foreground": g.fg,
    "selection.background": sel,
    "editor.background": g.bg,
    "editor.foreground": g.fg,
    "editorCursor.foreground": cursor,
    "editor.selectionBackground": sel,
    "editor.selectionHighlightBackground": a(c.blue, "22"),
    "editor.wordHighlightBackground": a(c.blue, "20"),
    "editor.wordHighlightStrongBackground": a(c.purple, "26"),
    "editor.findMatchBackground": a(c.orange, "55"),
    "editor.findMatchHighlightBackground": a(c.orange, "33"),
    "editor.lineHighlightBackground": dark ? "#ffffff0a" : "#00000008",
    "editor.rangeHighlightBackground": a(c.blue, "14"),
    "editorLineNumber.foreground": g.dim,
    "editorLineNumber.activeForeground": g.fg,
    "editorIndentGuide.background": dark ? "#ffffff10" : "#00000010",
    "editorIndentGuide.activeBackground": a(c.orange, "66"),
    "editorWhitespace.foreground": dark ? "#ffffff12" : "#00000012",
    "editorRuler.foreground": dark ? "#ffffff0e" : "#0000000e",
    "editorBracketMatch.background": a(c.orange, "22"),
    "editorBracketMatch.border": c.orange + "88",
    "editorError.foreground": c.red,
    "editorWarning.foreground": c.orange,
    "editorInfo.foreground": c.blue,
    "editorGutter.modifiedBackground": c.orange,
    "editorGutter.addedBackground": c.green,
    "editorGutter.deletedBackground": c.red,
    "editorWidget.background": g.bg2,
    "editorWidget.border": g.border,
    "editorHoverWidget.background": g.bg2,
    "editorHoverWidget.border": g.border,
    "editorSuggestWidget.background": g.bg2,
    "editorSuggestWidget.selectedBackground": g.bg3,
    "editorGroup.border": g.bg0,
    "editorGroupHeader.tabsBackground": g.bg1,
    "tab.activeBackground": g.bg,
    "tab.inactiveBackground": g.bg1,
    "tab.activeForeground": g.fg,
    "tab.inactiveForeground": g.fgSoft,
    "tab.border": g.bg0,
    "tab.activeBorderTop": cursor,
    "activityBar.background": g.bg0,
    "activityBar.foreground": g.fg,
    "activityBar.inactiveForeground": g.dim,
    "activityBarBadge.background": c.blue,
    "activityBarBadge.foreground": "#ffffff",
    "sideBar.background": g.bg1,
    "sideBar.foreground": g.fgSoft,
    "sideBarSectionHeader.background": g.bg0,
    "sideBarSectionHeader.foreground": g.fg,
    "sideBarTitle.foreground": g.fg,
    "list.activeSelectionBackground": g.bg3,
    "list.activeSelectionForeground": g.fg,
    "list.inactiveSelectionBackground": g.bg2,
    "list.hoverBackground": dark ? "#ffffff0c" : "#0000000a",
    "list.highlightForeground": cursor,
    "statusBar.background": g.bg1,
    "statusBar.foreground": g.fgSoft,
    "statusBar.noFolderBackground": g.bg1,
    "statusBar.debuggingBackground": c.orange,
    "statusBar.debuggingForeground": "#ffffff",
    "statusBarItem.remoteBackground": c.green,
    "titleBar.activeBackground": g.bg1,
    "titleBar.activeForeground": g.fg,
    "titleBar.inactiveBackground": g.bg1,
    "titleBar.inactiveForeground": g.dim,
    "panel.background": g.bg,
    "panel.border": g.bg0,
    "panelTitle.activeForeground": g.fg,
    "panelTitle.inactiveForeground": g.dim,
    "terminal.background": g.bg0,
    "terminal.foreground": g.fg,
    "terminal.ansiBlack": dark ? "#1a1a1a" : "#403a36",
    "terminal.ansiRed": c.red,
    "terminal.ansiGreen": c.green,
    "terminal.ansiYellow": c.yellow,
    "terminal.ansiBlue": c.blue,
    "terminal.ansiMagenta": c.purple,
    "terminal.ansiCyan": dark ? hsl(186, 58, 64) : hsl(186, 62, 40),
    "terminal.ansiWhite": g.fg,
    "terminal.ansiBrightBlack": g.dim,
    "terminal.ansiBrightRed": dark ? hsl(0, 70, 70) : hsl(0, 70, 48),
    "terminal.ansiBrightGreen": dark ? hsl(154, 64, 70) : hsl(154, 64, 36),
    "terminal.ansiBrightYellow": dark ? hsl(40, 70, 70) : hsl(40, 72, 44),
    "terminal.ansiBrightBlue": dark ? hsl(210, 70, 72) : hsl(210, 70, 46),
    "terminal.ansiBrightMagenta": dark ? hsl(330, 70, 72) : hsl(330, 64, 48),
    "terminal.ansiBrightCyan": dark ? hsl(186, 64, 72) : hsl(186, 64, 44),
    "terminal.ansiBrightWhite": dark ? "#ffffff" : "#1a1a1a",
    "input.background": g.bg2,
    "input.border": g.border,
    "input.foreground": g.fg,
    "dropdown.background": g.bg2,
    "dropdown.border": g.border,
    "button.background": c.green,
    "button.foreground": dark ? "#1a2410" : "#ffffff",
    "button.hoverBackground": dark ? hsl(154, 58, 58) : hsl(154, 62, 36),
    "badge.background": c.blue,
    "badge.foreground": "#ffffff",
    "scrollbarSlider.background": dark ? "#ffffff1a" : "#00000018",
    "scrollbarSlider.hoverBackground": dark ? "#ffffff2a" : "#00000028",
    "scrollbarSlider.activeBackground": dark ? "#ffffff3a" : "#00000038",
    "progressBar.background": c.orange,
    "breadcrumb.foreground": g.fgSoft,
    "breadcrumb.focusForeground": g.fg,
    "gitDecoration.modifiedResourceForeground": c.orange,
    "gitDecoration.addedResourceForeground": c.green,
    "gitDecoration.deletedResourceForeground": c.red,
    "gitDecoration.untrackedResourceForeground": c.green,
    "gitDecoration.ignoredResourceForeground": g.dim,
    "gitDecoration.conflictingResourceForeground": c.purple,
    "peekView.border": c.blue,
    "textLink.foreground": c.blue,
    "textLink.activeForeground": dark ? hsl(210, 64, 74) : hsl(210, 70, 36),
  };

  const r = (scope, foreground, fontStyle) => ({
    ...(scope ? { scope } : {}),
    settings: { ...(foreground ? { foreground } : {}), ...(fontStyle ? { fontStyle } : {}) },
  });
  const tokenColors = [
    r(null, undefined, undefined), // (global settings come from `colors`)
    r("comment, punctuation.definition.comment", g.dim, "italic"),
    r("string, string.quoted, string.template, meta.string", c.green),
    r("constant.character.escape, constant.other.placeholder, string.regexp constant.character.escape", c.purple),
    r("string.regexp, keyword.operator.regexp", c.orange),
    r("constant.numeric, constant.numeric.integer, constant.numeric.float, keyword.other.unit", c.purple),
    r("constant.language, constant.language.boolean, constant.language.null, constant.language.undefined", c.orange),
    r("constant.other, support.constant, constant.other.color", c.orange),
    r("keyword, keyword.control, keyword.other, keyword.declaration", c.pink),
    r("keyword.operator, keyword.operator.new, keyword.operator.expression, punctuation.accessor", c.pink),
    r("storage, storage.type, storage.modifier", c.pink),
    r("entity.name.function, support.function, meta.function-call entity.name.function, variable.function", c.blue),
    r("entity.name.class, entity.name.type, entity.name.namespace, support.type, support.class, entity.other.inherited-class, entity.name.type.class", c.yellow),
    r("entity.name.tag, punctuation.definition.tag", c.pink),
    r("entity.other.attribute-name, entity.other.attribute-name.html, entity.other.attribute-name.class.css", c.green),
    r("support.type.property-name, meta.object-literal.key, support.type.property-name.json, support.type.property-name.css, entity.name.tag.yaml", c.blue),
    r("variable, variable.other, variable.other.readwrite, meta.definition.variable", g.fg),
    r("variable.other.constant, variable.other.enummember", c.orange),
    r("variable.parameter, meta.function.parameters", c.orange, "italic"),
    r("variable.language, variable.language.this, variable.language.self, variable.language.super", c.orange, "italic"),
    r("entity.name.function.decorator, meta.decorator, punctuation.decorator, meta.annotation, storage.type.annotation", c.yellow),
    r("punctuation, meta.brace, punctuation.separator, punctuation.terminator, punctuation.definition.parameters", g.fgSoft),
    r("entity.name.label, support.other.namespace", c.yellow),
    // markdown / mdx
    r("markup.heading, markup.heading entity.name, entity.name.section", c.blue, "bold"),
    r("markup.bold", c.orange, "bold"),
    r("markup.italic", g.fg, "italic"),
    r("markup.underline.link, markup.link, string.other.link, constant.other.reference.link", c.blue, "underline"),
    r("markup.inline.raw, markup.raw, markup.fenced_code", c.green),
    r("markup.quote", g.fgSoft, "italic"),
    r("markup.list punctuation.definition.list.begin", c.pink),
    // diff
    r("markup.inserted, markup.inserted.diff, meta.diff.header.to-file", c.green),
    r("markup.deleted, markup.deleted.diff, meta.diff.header.from-file", c.red),
    r("markup.changed, markup.changed.diff", c.yellow),
    r("meta.diff.range, punctuation.definition.range.diff", c.purple),
    r("invalid, invalid.illegal", c.red),
    r("invalid.deprecated", c.orange),
  ];

  return { name: dark ? "Kronuz" : "Kronuz Light", type: variant, semanticHighlighting: true, colors, tokenColors };
}

for (const v of ["dark", "light"]) {
  const file = v === "dark" ? "Kronuz-color-theme.json" : "Kronuz-light-color-theme.json";
  writeFileSync(new URL(`./themes/${file}`, import.meta.url), JSON.stringify(build(v), null, "\t") + "\n");
  console.log(`wrote themes/${file}`);
}
