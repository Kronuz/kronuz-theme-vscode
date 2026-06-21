# Kronuz Theme

A warm, low-contrast theme for VS Code, built on a clean HSL palette
(red/orange/yellow/green/blue/purple/pink at a single saturation/lightness).
Neutral-gray UI surfaces, warmth in the text and accents, and a signature warm
caret.

Ships two variants:

- **Kronuz** — the dark theme (editor background `#322e2a`).
- **Kronuz Light** — a light variant in the same spirit (warm off-white
  background, the same hues deepened for contrast).

## Building

This repo is the **single source of truth** for the Kronuz syntax theme across
editors. The canonical dark theme lives in `src/base-dark.json` (the verbatim 0.0.6
tokenColors + workbench colors); `build.mjs` merges in a few modern, normalized scopes
and emits, identically:

- **VS Code** — `themes/Kronuz-color-theme.json` (dark) + `themes/Kronuz-light-color-theme.json`
- **Sublime Text** — `../Kronuz-Theme/Kronuz.sublime-color-scheme` (+ light)
- **TextMate** — `../kronuzsh/integrations/themes/Kronuz.tmTheme` (+ light), used by
  bat, git-delta and yazi's syntect code preview
- **Zed** — `zed/themes/Kronuz.json` (a theme family carrying both dark + light); drop it
  into `~/.config/zed/themes/` to use it

```sh
npm run build   # or: node build.mjs
```

Every **light** variant is derived mathematically from its dark counterpart (lightness
inverted, hue/saturation kept, chromatics deepened), so they never drift. Sibling repos
are written only when checked out next to this one. To change a colour, edit
`src/base-dark.json` (or the additions in `build.mjs`) and re-run.

**Enjoy!**
