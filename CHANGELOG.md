# Change Log

All notable changes to the "kronuz-theme" extension are documented here, per
[Keep a Changelog](http://keepachangelog.com/).

## [0.1.0]

### Added
- **Kronuz Light**, a light variant in the same spirit (same hues, deepened for
  contrast on a warm off-white background).
- A `build-theme.mjs` generator: both variants are produced from one HSL palette
  and one scope -> color map, so they stay consistent and are easy to tweak.

### Changed
- Rebuilt the syntax colors from the clean Kronuz palette
  (red/orange/yellow/green/blue/purple/pink). The previous rules mixed the
  palette with leftover ad-hoc hex from an older base; they are now a coherent,
  deliberate scope -> color mapping (comments, strings, keywords, functions,
  types, numbers, tags, attributes, markup, diff, ...).
- Filled in the workbench colors: terminal ANSI palette, git decorations,
  tabs/lists/inputs/badges, bracket matching, find/selection highlights, and
  more, all harmonized to the neutral-gray UI with warm caret and palette
  accents.

## [0.0.6]
- Initial release.
