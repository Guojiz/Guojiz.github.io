# Changelog

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
