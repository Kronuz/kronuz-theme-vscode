# AGENTS.md: working on kronuz-theme-vscode

This repo is the **single source of truth** for the Kronuz color theme across four
editors. Despite the name, it is not just a VS Code extension: one canonical
definition generates the VS Code, Sublime Text, TextMate, and Zed themes so they can
never drift. Read `README.md` for what the theme is; this file is how to **change** it
without breaking that guarantee.

## The golden rule

**Never hand-edit a generated theme file.** Everything under `themes/`, `zed/`, and the
sibling repos (below) is output. To change a color, edit the **input** and re-run the
generator:

1. Edit `src/base-dark.json` (the canonical colors) or the `additions`/`palette` in
   `build.mjs`.
2. `npm run build` (= `node build.mjs`).
3. Commit the regenerated outputs alongside the input change.

Editing an output directly will be silently overwritten on the next build, and (for VS
Code) hand-editing the *installed* extension under `~/.vscode/extensions/` makes VS Code
flag "Your Code installation appears to be corrupt" — it records each install's on-disk
state and self-heals. Always test via a packaged vsix instead (see Testing).

## Architecture

```
src/base-dark.json      verbatim 0.0.6 dark theme (47 workbench colors + 73 tokenColors)
        │
        │  + additions[]  (modern TextMate scopes the 0.0.6 theme predates)
        │  + palette{}     (the named classic colors: keyword, string, type, ...)
        ▼
     build.mjs  ── emits ──►  VS Code   themes/Kronuz-color-theme.json (+ light)
                              Sublime   ../Kronuz-Theme/*.sublime-color-scheme
                              TextMate  ../KronuZSH/integrations/themes/*.tmTheme
                              Zed       zed/themes/Kronuz.json  (dark + light in one file)
```

- **`src/base-dark.json`** is frozen verbatim 0.0.6 (the canonical look). The dark theme
  is `base.tokenColors` **plus** `additions` (scopes the base leaves unstyled, e.g.
  decorators, object-literal keys, namespaces — they never override the original).
- **`palette`** is the clean named layer (`keyword #cc7833`, `string #a5c261`, ...). It
  drives the Sublime `variables` block and the Zed named-token map, and it is what the
  off-palette report compares against.
- **Light variants are derived mathematically** by `toLight()` (HSL: invert lightness,
  keep hue/saturation, deepen chromatics so they read on a light page). Do **not**
  hand-tune a light file — fix `toLight` if a light color is wrong.
- **Off-palette colors are kept verbatim by request** (the ~12 odd ones: `token.*` debug
  colors, a few language one-offs). `#c1be91` (double-quoted strings) is deliberately
  kept off-palette — do not "normalize" it.

## Editors use different models (why there are separate emitters)

- VS Code / Sublime / TextMate are **scope-based**: dozens of TextMate selectors
  (`entity.name.*`, `meta.*`). Those three share `darkTokens` directly.
- **Zed is named-token-based**: a flat ~45-key set (`keyword`, `string`, `type`,
  `function`, ...), not scopes. The `zed()` emitter maps the named `palette` onto those
  keys (almost 1:1) — so when you add a color concept, set it in `palette` and add the
  Zed mapping, don't try to translate scopes for Zed.

To add a **new editor target**: add one emitter function fed by `palette` + `darkColors`
(reuse `ui()` for chrome and `toLight`/`mapColors` for the light variant), then a `write`
call at the bottom. The `zed()` emitter is the cleanest example to copy for a
named-token editor; `sublime()` for a scope+variables editor.

## Sibling-repo layout (required for a full build)

The generator writes the Sublime and TextMate outputs into **sibling checkouts**, only
when present (it skips with a note otherwise). For a complete build, check out next to
this repo under `~/Development/`:

```
~/Development/kronuz-theme-vscode   (this repo — source of truth + VS Code + Zed output)
~/Development/Kronuz-Theme          (Sublime output)        github.com/Kronuz/Kronuz-Theme
~/Development/KronuZSH              (TextMate output)        github.com/Kronuz/KronuZSH
```

A change to a color is therefore usually **three commits** (this repo + the two siblings).

## Testing & packaging (VS Code)

- **Build:** `npm run build`. It is idempotent — re-running with no input change leaves
  the sibling outputs byte-identical (clean `git status`).
- **Test the VS Code theme the safe way — via a packaged vsix, never by editing the
  installed dir:**
  ```sh
  npx @vscode/vsce package --allow-missing-repository --skip-license -o ~/scratch/test.vsix
  code --install-extension ~/scratch/test.vsix --force   # re-registers cleanly
  ```
  Then `Developer: Reload Window` and pick the theme (`Cmd+K Cmd+T`). To restore a clean
  stock extension: `code --install-extension <the repo's release vsix> --force`.
- **Zed:** drop `zed/themes/Kronuz.json` into `~/.config/zed/themes/` (picked up live);
  pick it via `Cmd+K Cmd+T`. It is a theme *family* file carrying both Kronuz and Kronuz
  Light. The `zed/` dir is excluded from the VS Code vsix (`.vscodeignore`).

## Git identity (public Kronuz repo)

This is one of German's **public** `github.com/Kronuz/*` repos. Commit as
**Germán Méndez Bravo \<german.mb@gmail.com\>** (the local config here already uses it).
Do **not** add a `Co-authored-by: Copilot` trailer. If commit signing prompts, use
`git -c commit.gpgsign=false commit`. Push with the Kronuz GitHub account over HTTPS
(the github.com SSH key auths as the work account, which lacks access):

```sh
git -c credential.helper='!gh auth git-credential' push https://github.com/Kronuz/<repo>.git
```
