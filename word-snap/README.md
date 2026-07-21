# Word Snap

Word Snap is a static single-page vocabulary matching practice app. Match pairs (default: Chinese meaning ↔ English word), review with adaptive prioritization, and keep everything offline in the browser.

- Live: [https://guojiz.github.io/word-match/vocabulary-match.html](https://guojiz.github.io/word-match/vocabulary-match.html)
- Source: [https://github.com/Guojiz/Guojiz.github.io/tree/main/word-match](https://github.com/Guojiz/Guojiz.github.io/tree/main/word-match)
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
- Adaptive review: mistakes, slow answers, unstable words, and due reviews come first.
- Per-word draw tracking: `draws`, `lastDrawRound`, `drawProbability`.
- Single and bulk word import; every word can be deleted or cleared.
- Empty-library prompt when there is nothing to practice.
- Practice options: level timer, refill batch size, refill delay, recent-history window, anti-repeat strength, pause refill while selected, recycle mastered words.
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

## Adaptive draw logic

Word Snap is not pure random. It reduces immediate repeats while boosting under-practiced, mistaken, slow, or due words.

Each word stores:

- `draws` — times drawn onto the board
- `lastDrawRound` — last level it appeared
- `drawProbability` — weight used when building the queue

When building a queue it:

- prioritizes due, weak, slow, and mistaken words;
- down-weights recent history;
- boosts words below average draws;
- reduces words above average draws;
- can recycle mastered words so the queue never empties;
- pauses refill while a card is selected so new cards do not interrupt choice.

## How to use

Local:

```text
index.html
```

Online: open the [live URL](https://guojiz.github.io/word-match/vocabulary-match.html).

On iPhone/iPad: Safari → Share → **Add to Home Screen**. The PWA name is **Word Snap**. After updates, if you still see an old Chinese-only UI, fully quit Safari and reopen so the new service worker (`word-snap-v9+`) can replace the cache.

## Bulk import format

In Library → Bulk input, one pair per line:

```text
apple,苹果
banana,香蕉
UNESCO = 联合国教科文组织
```

Comma and `=` are both supported. First field maps to the internal `en` side; second maps to `zh`.

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

- 在线体验：[https://guojiz.github.io/word-match/vocabulary-match.html](https://guojiz.github.io/word-match/vocabulary-match.html)
- 源码：[https://github.com/Guojiz/Guojiz.github.io/tree/main/word-match](https://github.com/Guojiz/Guojiz.github.io/tree/main/word-match)
- 更新日志：[CHANGELOG.md](./CHANGELOG.md)

## 适合谁

- 想用小游戏方式复习英文/双语词汇的人；
- 想导入自己的词表并反复练习的人；
- 想让不熟、错过、反应慢的词更多出现的人；
- 想要不登录、打开即用的轻量工具的人。

## 功能特点

- 10 格流式配对：左 5、右 5；快捷键 `1`–`0`；即时判定。
- 自适应复习、抽取统计、单条/批量加词、可清空词库。
- 练习选项：每关时间、补词批量与延迟、历史窗口、防重复强度、选中暂停补词、掌握后循环。
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

第一段写入内部 `en` 侧，第二段写入 `zh` 侧。

## 数据说明

无需登录，不上传服务器。清理站点数据或换设备可能导致丢失，请自行备份词表。

## 已知限制

- 面板方向固定（左 `zh`、右 `en`），语言对只改标签；
- 内置词库仅英↔中；
- 语言偏好按设备/浏览器存储。
