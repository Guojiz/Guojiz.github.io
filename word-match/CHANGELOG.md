# Changelog

## 2026-07-19

### Added

- Adaptive level timer: next level duration is projected from **actual clear pace** (time from level start to the last correct pair) × this queue size, with a configurable tolerance (default `0.2` / +20%). Base time is used for the first level or when adaptive is off.
- Practice options: “Adaptive level time” checkbox and “Time tolerance”.
- Progress persistence: score, mistakes, streak, round, and last-level pace are saved with words/settings under `localStorage` (`duo_like_word_match_v1`), including when installed as a PWA on the same origin.

### Fixed

- Adaptive timer no longer confuses the **countdown allotment** with **actual completion time**. Pace is sampled only on a real queue clear, using `levelStartedAt` → `lastPairAt` (not the leftover timer, and not timeout cutoffs).
- Fixed a bug where per-pair reaction resets of `roundStartedAt` corrupted level duration samples.
- English rail / panel button labels overflowing their boxes (wrap + smaller type).
- Bulk-input placeholder newlines when set via `t()`.

### Changed

- Service worker cache bumped to `word-snap-v11`.

## 2026-07-07

### Added

- Bilingual UI (English / 中文) with `data-en` / `data-zh` static attributes, `t()` for dynamic copy, and an **EN / 中** toggle in the rail and mobile nav.
- Locale preference key `word_snap_lang` (browser detect on first visit; not shared with main-site `guojiz.lang`).
- English metadata: `html lang="en"`, meta description, manifest `"lang": "en"`.
- Configurable **language-pair labels** in practice options (presets + custom); renames column labels and bulk placeholder only — matching fields stay `en` / `zh`.

### Changed

- Service worker cache bumped to `word-snap-v9` so installed PWAs pick up the bilingual shell.
- README rewritten with English primary section and a Chinese section; documents language toggle and language-pair usage.

## 2026-07-06

### Added

- Added full vocabulary clearing: default words can now be deleted or cleared just like custom words.
- Added an empty-library state that prompts the user to add words before practicing.
- Added practice options in the vocabulary modal:
  - level duration
  - refill batch size
  - refill delay range
  - recent-history window for adaptive selection
  - anti-repeat strength
  - pause refill while a card is selected
  - recycle mastered words after the list is stable
- Added per-word draw tracking with `draws`, `lastDrawRound`, and `drawProbability`.
- Added a visible draw count in the vocabulary list.

### Changed

- Reworked adaptive word selection using an InkCanvas-style draw history model:
  - recent words are down-weighted to avoid immediate repetition
  - under-practiced words are boosted
  - over-selected words are reduced
  - due review, weak, slow, and mistaken words still get priority
- Changed the progress bar to show current level progress instead of long-term mastery percentage.
- Changed refill behavior so new words wait while the user has a card selected, preventing selection interruptions.
- Changed completion detection so a finished level always transitions to the completion screen instead of leaving an empty board.
- Updated vocabulary management copy from "custom vocabulary" to "vocabulary" because all words are editable.

### Fixed

- Fixed default words being restored after clearing the vocabulary.
- Fixed empty word lists being treated as completed practice.
- Fixed card selection being interrupted by asynchronous refills.
- Fixed the board getting stuck empty at `8/8` after the last match.
- Fixed several two-character Chinese labels and buttons not being visually centered.
