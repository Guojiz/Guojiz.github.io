# Word Snap

Word Snap is a static single-page vocabulary matching practice app. Match pairs (default: Chinese meaning ↔ English word), review with adaptive prioritization, and keep everything offline in the browser.

- Live: [https://guojiz.github.io/word-snap/vocabulary-match.html](https://guojiz.github.io/word-snap/vocabulary-match.html)
- Source: [https://github.com/Guojiz/word-snap](https://github.com/Guojiz/word-snap)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

## Who it is for

- People who want game-like English (or bilingual) vocabulary review;
- Anyone who wants to import a custom word list and drill it repeatedly;
- Learners who want weak, missed, and slow words to appear more often;
- Users who want a login-free, open-and-play practice tool.

## Features

- 10-slot streaming match board: 5 cards on the left, 5 on the right.
- Keyboard shortcuts `1`–`0`.
- Instant match feedback (no submit step).
- Correct pairs flash and clear; new words refill from the queue.
- Wrong pairs shake and roll back into practice.
- Box-based review: missed words come back next round, correct ones after longer and longer gaps; new words arrive in small batches.
- Single and bulk word import; every word can be deleted.
- **Danger zone → Clear all words.** The library is designed to keep growing: practice mixes reviewing old words with learning new ones, and mastered words simply come up less often, so you normally never clear it. Clearing is only for switching to a completely different set (new textbook, term, or language). Use **Copy word list backup** first; pasting the backup into Bulk input restores the words (not their progress).
- Empty-library prompt when there is nothing to practice.
- Practice options: practice mode (adaptive / weak only / all in order), level timer, refill delay, pause refill while selected, recycle mastered words.
- Synonyms count: if two entries share a meaning (e.g. `big` / `large` = 大的), either English card matches it.
- End-of-level review: words you mixed up are listed with their meaning.
- The level timer pauses while the Library is open or the app is in the background.
- Configurable **language-pair labels** (display only — see below).
- UI language: **English / 中文** toggle with browser detection + local preference.
- PWA basics: manifest, icons, service worker, Add to Home Screen.

## UI language

- Default: browser language (`navigator.language`). If it starts with `en`, the UI is English; otherwise Chinese.
- Preference is stored under `word_snap_lang` on this device only. It does **not** share the main site key `guojiz.lang`.
- Toggle with **EN / 中** in the side rail (desktop) or bottom nav (mobile).
- Switching language updates all visible chrome (nav, stats, library modal, options, install nudge, completion copy). It does not restart the current level.

## Language pairs (word labels)

In **Library → Practice options → Language pair** you can rename the two column labels, for example:

- English ↔ 中文 (default)
- English ↔ 日本語
- English ↔ Español
- 中文 ↔ English
- Custom names for side A and side B

**Important (Option 2):** only the **labels** change. Internal fields remain `en` / `zh`, and matching logic is unchanged. The left column always shows the `zh` field content; the right column always shows the `en` field content. Choosing “中文 → English” as labels does **not** flip the board. Built-in starter words are English ↔ Chinese only. Full field rename (`en`/`zh` → `a`/`b`) is on the roadmap (Option 1).

## Review logic (boxes)

Word Snap uses a simple box system (Leitner). It is a web page and cannot send reminders, so gaps are counted in **rounds played**, not on the clock.

Each word sits in box 0–5:

| Box | Comes back after | …or after (if you were away) |
| --- | --- | --- |
| 0 — just missed | next round | 10 minutes |
| 1 | 2 rounds | 1 day |
| 2 | 4 rounds | 3 days |
| 3 | 8 rounds | 7 days |
| 4 | 16 rounds | 14 days |
| 5 — mastered | 32 rounds (spot check) | 30 days |

- Wrong pair → the word you were answering goes to box 0; the card you wrongly picked drops one box.
- Right pair → one box up, **only if the word was due**. Matching it again early does not count.
- Synonyms (same meaning or same word) are accepted as correct.

Each round (up to “Words per round”) is built in this order:

1. words missed last time;
2. other due words, lowest box first;
3. a small batch of new words (about a third of a round) — only while fewer than a round's worth of words are still in boxes 0–1, so a 200-word import never floods you;
4. fill with words not yet due, lowest box and least recently seen first.

The library is meant to keep growing; you don't need to clear it. Mastered words simply come up rarely.

## How to use

Local:

```text
index.html
```

Online: open the [live URL](https://guojiz.github.io/word-snap/vocabulary-match.html).

On iPhone/iPad: Safari → Share → **Add to Home Screen**. The PWA name is **Word Snap**. After updates, if you still see an old Chinese-only UI, fully quit Safari and reopen so the new service worker (`word-snap-v9+`) can replace the cache.

## Bulk import format

In Library → Bulk input, one pair per line:

```text
apple,苹果
banana,香蕉
UNESCO = 联合国教科文组织
```

Tab (spreadsheet / Anki paste), `=`, comma (`,` or `，`) and a spaced dash (`word - meaning`) are supported. Only the first separator splits the line, so a meaning may contain commas. First field maps to the internal `en` side; second maps to `zh`.

## Data

No account, no server upload. Words, settings, and progress stay in the current browser.

Clearing site data, switching device/browser, or private mode can wipe local state. Back up your word list if you need it long-term.

## Known limits

- Board orientation is fixed: left = `zh` content, right = `en` content; language-pair presets only rename labels.
- Starter vocabulary is English ↔ Chinese.
- Language preference is per-device / per-browser.

---

# 中文说明

Word Snap 是一个静态单页单词配对练习网页，通过配对（默认：中文释义 ↔ 英文单词）帮助复习词汇。可部署到 GitHub Pages；单词、设置与进度保存在浏览器本地。

- 在线体验：[https://guojiz.github.io/word-snap/vocabulary-match.html](https://guojiz.github.io/word-snap/vocabulary-match.html)
- 源码：[https://github.com/Guojiz/word-snap](https://github.com/Guojiz/word-snap)
- 更新日志：[CHANGELOG.md](./CHANGELOG.md)

## 适合谁

- 想用小游戏方式复习英文/双语词汇的人；
- 想导入自己的词表并反复练习的人；
- 想让不熟、错过、反应慢的词更多出现的人；
- 想要不登录、打开即用的轻量工具的人。

## 功能特点

- 10 格流式配对：左 5、右 5；快捷键 `1`–`0`；即时判定。
- 盒子式复习（答错下一轮再来，答对隔得越来越久）、新词小批量加入、单条/批量加词、单个删除。
- **危险操作 → 清空全部词。** 词库的设计是越积越多：练习会自动混合复习旧词和学习新词，掌握的词只是出现得更少，所以平时不需要清空。只有彻底换一套词（换教材、换学期、换语言）时才用。清空前先点「复制词表备份」，之后粘贴回「批量录入」即可恢复单词（学习进度不恢复）。
- 练习选项：练习模式（自适应 / 只练弱项 / 全量顺序）、每关时间、补词延迟、选中暂停补词、掌握后循环。
- 同义词都算对：两个词条释义相同时（如 `big` / `large` = 大的），任一英文卡都能配上。
- 每关结束列出本关混淆过的词及释义，方便回顾。
- 打开词库或切到后台时，本关计时自动暂停。
- **界面中英切换**；**语言对标签**可配置（见下）。
- PWA：manifest、图标、service worker、添加到主屏幕。

## 语言切换

- 默认按浏览器语言：`navigator.language` 以 `en` 开头则英文，否则中文。
- 偏好存于 `word_snap_lang`，**不与**主站 `guojiz.lang` 共享。
- 侧栏 / 底栏 **EN / 中** 切换；切换会刷新可见文案，但不会重开当前关卡。

## 多语言词对用法

在 **词库 → 练习选项 → 语言对** 可改两侧列标题，例如 English↔中文、English↔日本語、自定义等。

**注意（方案 Option 2）：** 只改显示标签，内部字段仍是 `en`/`zh`，匹配逻辑不变。左列始终显示 `zh` 字段内容，右列始终显示 `en` 字段内容；选「中文→English」只换标签、不翻边。内置词库仅英↔中。全量字段重构（Option 1）在后续路线图。

## 使用方式

本地打开 `index.html`，或使用线上地址。iPhone 用 Safari「添加到主屏幕」；若仍见旧版中文缓存，可强关 Safari 再开以激活新 SW（`word-snap-v9+`）。

## 批量导入

每行一对，逗号或等号均可：

```text
apple,苹果
UNESCO = 联合国教科文组织
```

也支持 Tab（从表格 / Anki 复制）和带空格的短横线（`word - 释义`）。只按第一个分隔符拆分，释义里可以有逗号。第一段写入内部 `en` 侧，第二段写入 `zh` 侧。

## 数据说明

无需登录，不上传服务器。清理站点数据或换设备可能导致丢失，请自行备份词表。

## 已知限制

- 面板方向固定（左 `zh`、右 `en`），语言对只改标签；
- 内置词库仅英↔中；
- 语言偏好按设备/浏览器存储。
