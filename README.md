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

Both variants are generated from one palette and one scope -> color map:

```sh
npm run build   # or: node build-theme.mjs
```

Edit the palette or the scope map in `build-theme.mjs` and re-run to regenerate
`themes/Kronuz-color-theme.json` and `themes/Kronuz-light-color-theme.json`.

**Enjoy!**
