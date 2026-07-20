# Changelog

## 2026-07-20

### Added

- Streak scale tones: piano-informed broken-chord ladder — each correct pair jumps up two scale degrees (thirds), five notes per group, and each new group starts one degree higher (C E G B D → D F A C E → …), starting from middle C (C4) and covering the full diatonic cycle in exactly 40 streaks before wrapping. Timbre is additive piano synthesis (8 sine partials with inharmonicity + hammer noise + natural decay); a miss plays two soft low piano notes.

### Changed

- Refill logic rewritten to copy Duolingo Match Madness exactly (verified against screen recording): each cleared pair's two holes refill fast (~0.45–0.75s) and independently — each hole takes the partner of the oldest unmatched half on the opposite column, or the next fresh word from a single deck. A left card can temporarily have no match on the right until its other half arrives at a later right hole, which makes fixed-seat tapping impossible by design and keeps the board nearly full.
- Theme palettes now derive card hover, selected, correct, wrong, track, shadow, and scrim colors from the active skin instead of stacking fixed forest-colored surfaces, so each level rotation reads as one palette.
- Wrong answers no longer queue a replay word; the pair simply stays on the board (Duo behavior).
- Background surface stays fixed on the default forest palette (`#131f24`); only accent colors (green/blue/red/yellow) rotate after each level.
- Streak piano tones are optional (Practice options → “连对时播放钢琴音阶”, default on); groups stay at 5 notes, and the last note of each group plays a same-timbre piano flourish (root + octave + soft higher partial) instead of a separate coin SFX.
- Service worker cache bumped to `word-snap-v32`.

## 2026-07-19

### Added

- Adaptive level timer: next level duration is projected from **actual clear pace** (time from level start to the last correct pair) × this queue size, with a configurable tolerance (default `0.2` / +20%). Base time is used for the first level or when adaptive is off.
- Practice options: “Adaptive level time” checkbox and “Time tolerance”.
- Progress persistence: score, mistakes, streak, round, and last-level pace are saved with words/settings under `localStorage` (`duo_like_word_match_v1`), including when installed as a PWA on the same origin.
- **Color skins:** finishes a level → rotates through 8 soft palettes (bg + accents); preference stored as `themeIndex` / `word_snap_theme_index`.

### Fixed

- Adaptive timer no longer confuses the **countdown allotment** with **actual completion time**. Pace uses `levelStartedAt` → `lastPairAt` and **completed pair count** (not the prescribed queue size when unfinished/timeout).
- Incomplete levels still update throughput (`actualWorkMs / completedPairs`); next budget = pace × next queue × (1+tol), with a small extra margin when unfinished.
- Selection no longer drops when new words refill mid-choice: refill paints **only the two new cells** (no full-grid rebuild), holds the refill timer without releasing its reservation while a card is selected/locked, and resumes after deselect/match.
- Early clear now stops the countdown: when board and queues are empty, pending refills are cancelled and completion opens instead of ticking out the allotment.
- **Duo-like refill:** after a match, only the two empty seats wait ~2s then one new word appears on both sides with a slow enter animation. Other cards stay put and stay tappable; multiple holes may refill independently. No full-column reshuffle.
- Fixed a bug where per-pair reaction resets of `roundStartedAt` corrupted level duration samples.
- English rail / panel button labels overflowing their boxes (wrap + smaller type).
- Bulk-input placeholder newlines when set via `t()`.

### Changed

- Service worker cache bumped to `word-snap-v18`.
- Default refill delay ~1.9–2.3s; board stays full while the queue has words.

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
